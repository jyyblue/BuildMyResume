import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Edit3, Save, Undo, Redo } from "lucide-react";

interface ResumePreviewProps {
  data: any;
  TemplateComponent: React.ComponentType<any>;
  isEditing?: boolean;
  editableContent?: string;
  setEditableContent?: (html: string) => void;
  onSave?: (content: string) => void;
  zoom?: number;
  setZoom?: (z: number) => void;
  pageCount?: number;
  setPageCount?: (n: number) => void;
  showZoomControls?: boolean;
  containerClassName?: string;
  secureExportRef?: React.RefObject<HTMLDivElement>;
  rightControls?: React.ReactNode;
}

interface HistoryState {
  content: string;
  timestamp: number;
}

const baseWidth = 794; // A4 width px

export const ResumePreview = ({
  data,
  TemplateComponent,
  isEditing = false,
  editableContent = "",
  setEditableContent,
  onSave,
  showZoomControls = true,
  containerClassName = "",
  secureExportRef,
  rightControls,
}: ResumePreviewProps) => {
  const [zoom, setZoom] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const historyTimeoutRef = useRef<NodeJS.Timeout>();
  const isUndoRedoRef = useRef(false);

  const [localContent, setLocalContent] = useState(editableContent || '<div><br></div>');

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize history when editing starts
  useEffect(() => {
    if (isEditing && history.length === 0) {
      const initialState: HistoryState = {
        content: editableContent || '<div><br></div>',
        timestamp: Date.now()
      };
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, [isEditing, editableContent, history.length]);

  // Save cursor position
  const saveCursorPosition = useCallback(() => {
    if (!editableRef.current) return null;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const startMarker = document.createElement('span');
    const endMarker = document.createElement('span');
    startMarker.id = 'cursor-start-marker';
    endMarker.id = 'cursor-end-marker';
    startMarker.style.display = 'none';
    endMarker.style.display = 'none';
    try {
      const clonedRange = range.cloneRange();
      clonedRange.collapse(false);
      clonedRange.insertNode(endMarker);
      range.collapse(true);
      range.insertNode(startMarker);
      return { startMarker, endMarker };
    } catch (e) {
      startMarker.remove();
      endMarker.remove();
      return null;
    }
  }, []);

  // Restore cursor position
  const restoreCursorPosition = useCallback((markers: { startMarker: HTMLElement; endMarker: HTMLElement } | null) => {
    if (!markers || !editableRef.current) return;
    try {
      const { startMarker, endMarker } = markers;
      const selection = window.getSelection();
      if (!selection) return;
      if (startMarker.parentNode && endMarker.parentNode) {
        const range = document.createRange();
        range.setStartAfter(startMarker);
        range.setEndBefore(endMarker);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      startMarker.remove();
      endMarker.remove();
    } catch (e) {
      try {
        markers.startMarker.remove();
        markers.endMarker.remove();
      } catch {
        // Ignore cleanup errors
      }
    }
  }, []);

  // Clean HTML content
  const cleanContent = useCallback((html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const svgElements = tempDiv.querySelectorAll('svg');
    svgElements.forEach(svg => svg.setAttribute('data-preserve', 'true'));
    const emptyElements = tempDiv.querySelectorAll('*:not([data-preserve])');
    emptyElements.forEach(el => {
      if (
        el.textContent?.trim() === '' &&
        (el.tagName === 'U' || (el as HTMLElement).style.textDecoration?.includes('underline'))
      ) {
        el.remove();
      }
    });
    const cleanEmptyElements = (element: Element) => {
      Array.from(element.children).forEach(child => {
        if (child.hasAttribute('data-preserve')) return;
        cleanEmptyElements(child);
        if (
          child.textContent?.trim() === '' &&
          child.children.length === 0 &&
          !['BR', 'IMG', 'HR'].includes(child.tagName)
        ) {
          child.remove();
        }
      });
    };
    cleanEmptyElements(tempDiv);
    svgElements.forEach(svg => svg.removeAttribute('data-preserve'));
    return tempDiv.innerHTML;
  }, []);

  // Add to history
  const addToHistory = useCallback((content: string) => {
    if (isUndoRedoRef.current) return;
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        const newState: HistoryState = {
          content: cleanContent(content),
          timestamp: Date.now()
        };
        newHistory.push(newState);
        if (newHistory.length > 50) return newHistory.slice(-50);
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, 500);
  }, [historyIndex, cleanContent]);

  // Fit to width
  const fitToWidth = useCallback((containerWidth: number) => {
    const padding = 64;
    const availableWidth = containerWidth - padding;
    const newZoom = Math.min(Math.max(availableWidth / baseWidth, 0.5), 1.2);
    setZoom(prev => {
      if (Math.abs(prev - newZoom) > 0.001) return newZoom;
      return prev;
    });
  }, []);

  // Initialize with fit-to-width (once)
  useEffect(() => {
    if (wrapperRef.current && !isInitialized) {
      setTimeout(() => {
        if (wrapperRef.current) {
          fitToWidth(wrapperRef.current.clientWidth);
          setIsInitialized(true);
        }
      }, 100);
    }
  }, [isInitialized, fitToWidth]);

  // Handle window resize to refit
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current && isInitialized) {
        fitToWidth(wrapperRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized, fitToWidth]);

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.2));
  const handleResetZoom = () => setZoom(1);
  const handleFitToWidth = () => {
    if (wrapperRef.current) fitToWidth(wrapperRef.current.clientWidth);
  };

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && editableRef.current) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      const markers = saveCursorPosition();
      editableRef.current.innerHTML = prevState.content;
      setLocalContent(prevState.content);
      if (setEditableContent) setEditableContent(prevState.content);
      setHistoryIndex(newIndex);
      setHasUnsavedChanges(true);
      setTimeout(() => {
        restoreCursorPosition(markers);
        isUndoRedoRef.current = false;
      }, 10);
    }
  }, [historyIndex, history, saveCursorPosition, restoreCursorPosition, setEditableContent]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1 && editableRef.current) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      const markers = saveCursorPosition();
      editableRef.current.innerHTML = nextState.content;
      setLocalContent(nextState.content);
      if (setEditableContent) setEditableContent(nextState.content);
      setHistoryIndex(newIndex);
      setHasUnsavedChanges(true);
      setTimeout(() => {
        restoreCursorPosition(markers);
        isUndoRedoRef.current = false;
      }, 10);
    }
  }, [historyIndex, history, saveCursorPosition, restoreCursorPosition, setEditableContent]);

  // Save handler
  const handleSave = useCallback(() => {
    if (!editableRef.current || !onSave) return;
    const content = cleanContent(editableRef.current.innerHTML);
    if (setEditableContent) setEditableContent(content);
    setLocalContent(content);
    onSave(content);
    setHasUnsavedChanges(false);
  }, [onSave, cleanContent, setEditableContent]);

  // Content change handler
  const handleContentChange = useCallback(() => {
    if (!editableRef.current) return;
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
      if (!editableRef.current) return;
      const currentContent = editableRef.current.innerHTML;
      setLocalContent(currentContent);
      if (setEditableContent) setEditableContent(currentContent);
      setHasUnsavedChanges(true);
      addToHistory(currentContent);
    }, 100);
  }, [setEditableContent, addToHistory]);

  // Keyboard handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  // Paste handler
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const lines = text.split(/\r?\n/);
    let lastNode: Node | null = null;
    lines.forEach((line, index) => {
      if (index > 0) {
        const br = document.createElement('br');
        range.insertNode(br);
        range.setStartAfter(br);
        range.setEndAfter(br);
        lastNode = br;
      }
      if (line) {
        const textNode = document.createTextNode(line);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        lastNode = textNode;
      }
    });
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.setEndAfter(lastNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    setTimeout(() => handleContentChange(), 10);
  }, [handleContentChange]);

  // Focus on edit mode
  useEffect(() => {
    if (isEditing && editableRef.current) {
      setTimeout(() => {
        if (editableRef.current) editableRef.current.focus();
      }, 100);
    }
  }, [isEditing]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isEditing) return;
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) { e.preventDefault(); handleRedo(); }
            else { e.preventDefault(); handleUndo(); }
            break;
          case 'y': e.preventDefault(); handleRedo(); break;
          case 's': e.preventDefault(); handleSave(); break;
        }
      }
    };
    document.addEventListener('keydown', handleKeyDownGlobal);
    return () => document.removeEventListener('keydown', handleKeyDownGlobal);
  }, [isEditing, handleUndo, handleRedo, handleSave]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    };
  }, []);

  // Update innerHTML when isEditing or editableContent changes
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.innerHTML = editableContent || '<div><br></div>';
    }
  }, [isEditing, editableContent]);

  return (
    <div ref={wrapperRef} className={`flex flex-col ${containerClassName}`}>
      {showZoomControls && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg border">
          <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0" disabled={zoom <= 0.2}>
            <ZoomOut className="h-4 w-4 text-foreground" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0" disabled={zoom >= 3}>
            <ZoomIn className="h-4 w-4 text-foreground" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetZoom} className="h-8 px-3 text-xs font-medium text-foreground">
            {Math.round(zoom * 100)}%
          </Button>
          <Button variant="outline" size="sm" onClick={handleFitToWidth} className="h-8 w-8 p-0" title="Fit to width">
            <Maximize2 className="h-4 w-4 text-foreground" />
          </Button>

          {isEditing && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="outline" size="sm" onClick={handleUndo} className="h-8 w-8 p-0" disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
                <Undo className="h-4 w-4 text-foreground" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRedo} className="h-8 w-8 p-0" disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)">
                <Redo className="h-4 w-4 text-foreground" />
              </Button>
              {onSave && (
                <Button
                  variant={hasUnsavedChanges ? "default" : "outline"}
                  size="sm"
                  onClick={handleSave}
                  className="h-8 px-3 text-xs font-medium"
                  title="Save (Ctrl+S)"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {hasUnsavedChanges ? "Save*" : "Save"}
                </Button>
              )}
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            {rightControls}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg border overflow-auto resume-preview-container custom-scrollbar"
        style={{ minHeight: '400px' }}
      >
        <div className="p-4 lg:p-8 w-fit mx-auto">
          <div
            className="bg-white shadow-lg rounded-sm relative"
            style={{
              width: baseWidth * zoom,
              minWidth: baseWidth * zoom,
              height: 'auto',
              flexShrink: 0,
              overflow: 'visible',
            }}
          >
            <div style={{
              width: baseWidth * zoom,
              height: 'auto',
              overflow: 'visible',
              position: 'relative'
            }}>
              <div style={{
                width: baseWidth,
                height: 'auto',
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                position: 'relative',
                background: 'white',
                boxSizing: 'border-box',
              }}>
                <div style={{
                  position: 'relative',
                  width: baseWidth,
                  minHeight: 400,
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  boxSizing: 'border-box',
                  backgroundColor: 'transparent',
                }}>
                  {isEditing ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      ref={editableRef}
                      className="editable-resume-content"
                      style={{
                        outline: 'none',
                        cursor: 'text',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        overflow: 'visible',
                        caretColor: '#000',
                        WebkitUserSelect: 'text',
                        userSelect: 'text',
                      }}
                      onInput={handleContentChange}
                      onPaste={handlePaste}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        if (editableRef.current) {
                          const selection = window.getSelection();
                          if (!selection || selection.rangeCount === 0) {
                            const range = document.createRange();
                            range.selectNodeContents(editableRef.current);
                            range.collapse(false);
                            selection?.removeAllRanges();
                            selection?.addRange(range);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (editableRef.current && setEditableContent) {
                          const currentContent = editableRef.current.innerHTML;
                          const newContent = cleanContent(currentContent);
                          if (newContent !== currentContent) {
                            const markers = saveCursorPosition();
                            editableRef.current.innerHTML = newContent;
                            restoreCursorPosition(markers);
                          }
                          setEditableContent(newContent);
                          setLocalContent(newContent);
                          if (newContent !== editableContent) {
                            setHasUnsavedChanges(true);
                          }
                        }
                      }}
                    >
                      {editableContent ? (
                        <div dangerouslySetInnerHTML={{ __html: editableContent }} />
                      ) : data.editedHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: data.editedHtml }} />
                      ) : (
                        <TemplateComponent data={data} />
                      )}
                    </div>
                  ) : (
                    <div>
                      {editableContent ? (
                        <div dangerouslySetInnerHTML={{ __html: editableContent }} />
                      ) : data.editedHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: data.editedHtml }} />
                      ) : (
                        <TemplateComponent data={data} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};