import { Injectable, InternalServerErrorException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PublishDto } from './dto/publish.dto';

@Injectable()
export class PublishService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase URL or Key not found in environment variables.');
        }
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async checkRateLimit(clientIp: string) {
        try {
            const { data, error } = await this.supabase
                .rpc('get_rate_limit_info', { p_client_ip: clientIp });

            if (error) {
                if (error.code === 'PGRST202' || error.message?.includes('function') || error.message?.includes('not found')) {
                    return { allowed: true };
                }
                return { allowed: false, error: 'Failed to check rate limit' };
            }

            if (data && data.length > 0) {
                const info = data[0];
                const allowed = info.requests_in_window < info.max_requests;
                return {
                    allowed,
                    info,
                    error: allowed ? undefined : `Rate limit exceeded. Please try again after ${new Date(info.reset_time).toLocaleString()}`
                };
            }
            return { allowed: true };
        } catch (e) {
            return { allowed: true };
        }
    }

    async publishResume(publishDto: PublishDto, clientIp: string, userAgent: string) {
        const { encryptedResumeData, title, existingId } = publishDto;
        const resumeTitle = title || 'Resume';

        // RateLimit Check
        const rateLimit = await this.checkRateLimit(clientIp);
        if (!rateLimit.allowed) {
            throw new HttpException(rateLimit.error || 'Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        }

        if (existingId) {
            const { data, error } = await this.supabase
                .from('published_resumes')
                .update({
                    resume_data: encryptedResumeData,
                    title: resumeTitle,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingId)
                .select()
                .single();

            if (error) {
                if (error.code === '23514') throw new HttpException('Resume data too large or invalid format', HttpStatus.BAD_REQUEST);
                if (error.code === '23505') throw new HttpException('Duplicate resume detected', HttpStatus.CONFLICT);
                throw new InternalServerErrorException('Failed to update resume');
            }
            return { data };
        } else {
            const { data, error } = await this.supabase
                .from('published_resumes')
                .insert({
                    resume_data: encryptedResumeData,
                    title: resumeTitle,
                    template_name: 'default',
                    user_id: null
                })
                .select()
                .single();

            if (error) {
                console.error('[PublishService] Insert Error:', error);
                if (error.code === '23514') throw new HttpException('Resume data too large or invalid format', HttpStatus.BAD_REQUEST);
                if (error.code === '23505') throw new HttpException('Duplicate resume detected', HttpStatus.CONFLICT);
                throw new InternalServerErrorException('Failed to publish resume');
            }
            return { data };
        }
    }

    async getPublishedResume(id: string) {
        try {
            const { data, error } = await this.supabase
                .from('published_resumes')
                .select()
                .eq('id', id)
                .single();

            if (error) throw new NotFoundException('Resume not found');
            return { data };
        } catch {
            throw new NotFoundException('Resume not found');
        }
    }

    async deletePublishedResume(id: string) {
        try {
            const { error } = await this.supabase
                .from('published_resumes')
                .delete()
                .eq('id', id);

            if (error) throw new InternalServerErrorException('Failed to delete resume');
            return { success: true };
        } catch {
            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async getPublishingStats() {
        try {
            const { data, error } = await this.supabase
                .from('resume_publishing_stats')
                .select('*')
                .order('hour', { ascending: false })
                .limit(24);

            if (error) {
                if (error.code === 'PGRST202' || error.message?.includes('relation') || error.message?.includes('not found')) {
                    return { data: [] };
                }
                throw new InternalServerErrorException('Failed to fetch statistics');
            }
            return { data };
        } catch {
            return { data: [] };
        }
    }

    async cleanupOldResumes() {
        try {
            const { data, error } = await this.supabase
                .rpc('cleanup_old_anonymous_resumes');
            if (error) return { deletedCount: 0 };
            return { deletedCount: data };
        } catch {
            return { deletedCount: 0 };
        }
    }
}
