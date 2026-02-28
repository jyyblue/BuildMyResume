"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PublishService", {
    enumerable: true,
    get: function() {
        return PublishService;
    }
});
const _common = require("@nestjs/common");
const _supabasejs = require("@supabase/supabase-js");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PublishService = class PublishService {
    async checkRateLimit(clientIp) {
        try {
            const { data, error } = await this.supabase.rpc('get_rate_limit_info', {
                p_client_ip: clientIp
            });
            if (error) {
                if (error.code === 'PGRST202' || error.message?.includes('function') || error.message?.includes('not found')) {
                    return {
                        allowed: true
                    };
                }
                return {
                    allowed: false,
                    error: 'Failed to check rate limit'
                };
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
            return {
                allowed: true
            };
        } catch (e) {
            return {
                allowed: true
            };
        }
    }
    async publishResume(publishDto, clientIp, userAgent) {
        const { encryptedResumeData, title, existingId } = publishDto;
        const resumeTitle = title || 'Resume';
        // RateLimit Check
        const rateLimit = await this.checkRateLimit(clientIp);
        if (!rateLimit.allowed) {
            throw new _common.HttpException(rateLimit.error || 'Rate limit exceeded', _common.HttpStatus.TOO_MANY_REQUESTS);
        }
        if (existingId) {
            const { data, error } = await this.supabase.from('published_resumes').update({
                resume_data: encryptedResumeData,
                title: resumeTitle,
                updated_at: new Date().toISOString()
            }).eq('id', existingId).select().single();
            if (error) {
                if (error.code === '23514') throw new _common.HttpException('Resume data too large or invalid format', _common.HttpStatus.BAD_REQUEST);
                if (error.code === '23505') throw new _common.HttpException('Duplicate resume detected', _common.HttpStatus.CONFLICT);
                throw new _common.InternalServerErrorException('Failed to update resume');
            }
            return {
                data
            };
        } else {
            const { data, error } = await this.supabase.from('published_resumes').insert({
                resume_data: encryptedResumeData,
                title: resumeTitle,
                template_name: 'default',
                user_id: null
            }).select().single();
            if (error) {
                console.error('[PublishService] Insert Error:', error);
                if (error.code === '23514') throw new _common.HttpException('Resume data too large or invalid format', _common.HttpStatus.BAD_REQUEST);
                if (error.code === '23505') throw new _common.HttpException('Duplicate resume detected', _common.HttpStatus.CONFLICT);
                throw new _common.InternalServerErrorException('Failed to publish resume');
            }
            return {
                data
            };
        }
    }
    async getPublishedResume(id) {
        try {
            const { data, error } = await this.supabase.from('published_resumes').select().eq('id', id).single();
            if (error) throw new _common.NotFoundException('Resume not found');
            return {
                data
            };
        } catch  {
            throw new _common.NotFoundException('Resume not found');
        }
    }
    async deletePublishedResume(id) {
        try {
            const { error } = await this.supabase.from('published_resumes').delete().eq('id', id);
            if (error) throw new _common.InternalServerErrorException('Failed to delete resume');
            return {
                success: true
            };
        } catch  {
            throw new _common.InternalServerErrorException('An unexpected error occurred');
        }
    }
    async getPublishingStats() {
        try {
            const { data, error } = await this.supabase.from('resume_publishing_stats').select('*').order('hour', {
                ascending: false
            }).limit(24);
            if (error) {
                if (error.code === 'PGRST202' || error.message?.includes('relation') || error.message?.includes('not found')) {
                    return {
                        data: []
                    };
                }
                throw new _common.InternalServerErrorException('Failed to fetch statistics');
            }
            return {
                data
            };
        } catch  {
            return {
                data: []
            };
        }
    }
    async cleanupOldResumes() {
        try {
            const { data, error } = await this.supabase.rpc('cleanup_old_anonymous_resumes');
            if (error) return {
                deletedCount: 0
            };
            return {
                deletedCount: data
            };
        } catch  {
            return {
                deletedCount: 0
            };
        }
    }
    constructor(){
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase URL or Key not found in environment variables.');
        }
        this.supabase = (0, _supabasejs.createClient)(supabaseUrl, supabaseKey);
    }
};
PublishService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], PublishService);

//# sourceMappingURL=publish.service.js.map