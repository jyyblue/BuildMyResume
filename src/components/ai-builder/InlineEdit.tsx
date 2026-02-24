import { useState, useRef, useEffect, useCallback } from 'react';
import type { OnEditFn } from './types';

interface InlineEditProps {
    value: string;
    field: string;
    onEdit: OnEditFn;
    tag?: keyof JSX.IntrinsicElements;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    multiline?: boolean;
}

/**
 * InlineEdit — click any text to edit it in place.
 * Renders as a normal element. Click → contentEditable. Blur/Enter → saves.
 */
export function InlineEdit({
    value,
    field,
    onEdit,
    tag: Tag = 'span',
    className = '',
    style,
    placeholder = 'Click to edit',
    multiline = false,
}: InlineEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const ref = useRef<HTMLElement>(null);

    // When entering edit mode, focus and select all text
    useEffect(() => {
        if (isEditing && ref.current) {
            ref.current.focus();
            // Select all text
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(ref.current);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }, [isEditing]);

    const handleBlur = useCallback(() => {
        if (ref.current) {
            const newValue = ref.current.innerText.trim();
            if (newValue !== value) {
                onEdit(field, newValue);
            }
        }
        setIsEditing(false);
    }, [value, field, onEdit]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            (e.target as HTMLElement).blur();
        }
        if (e.key === 'Escape') {
            // Revert
            if (ref.current) {
                ref.current.innerText = value || '';
            }
            setIsEditing(false);
        }
    }, [value, multiline]);

    const isEmpty = !value || value.trim() === '';

    // @ts-ignore — dynamic tag
    const Element = Tag as any;

    return (
        <Element
            ref={ref}
            className={`${className} cursor-text outline-none transition-all duration-150 ${isEditing
                    ? 'ring-2 ring-blue-400 ring-offset-1 rounded-sm bg-blue-50/30'
                    : 'hover:bg-blue-50/20 hover:ring-1 hover:ring-blue-200 rounded-sm'
                } ${isEmpty && !isEditing ? 'text-gray-300 italic' : ''}`}
            style={{
                ...style,
                minWidth: '2rem',
                minHeight: '1em',
            }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={() => !isEditing && setIsEditing(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            data-field={field}
            data-placeholder={placeholder}
        >
            {isEmpty && !isEditing ? placeholder : value}
        </Element>
    );
}
