// src/components/HtmlEditor.tsx
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface HtmlEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function HtmlEditor({ value, onChange }: HtmlEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="w-full">
      <style jsx global>{`
        /* Estilos customizados para toolbar compacta */
        .tox-toolbar {
          padding: 4px !important;
          min-height: 32px !important;
        }
        .tox-toolbar__group {
          padding: 0 2px !important;
        }
        .tox-tbtn {
          width: 28px !important;
          height: 28px !important;
          margin: 0 1px !important;
        }
        .tox-tbtn__select-label {
          font-size: 11px !important;
          padding: 0 4px !important;
        }
        .tox-toolbar__primary {
          background: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .tox-toolbar__overflow {
          background: #f8fafc !important;
        }
      `}</style>
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || process.env.TINYMCE_API_KEY}
        onInit={(evt: any, editor: any) => {
          editorRef.current = editor;
        }}
        initialValue={value}
        init={{
          height: 500,
          menubar: false,
          branding: false,
          // Configurações de toolbar compacta
          toolbar_mode: 'wrap',
          toolbar_sticky: true,
          toolbar_sticky_offset: 0,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect fontselect fontsizeselect | ' +
                   'bold italic underline strikethrough | forecolor backcolor | ' +
                   'alignleft aligncenter alignright alignjustify | ' +
                   'bullist numlist outdent indent | ' +
                   'link image media table | ' +
                   'removeformat | code preview fullscreen | help',
          content_style: `
            body { 
              font-family: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #111827;
              font-weight: 600;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            p {
              margin-bottom: 1em;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          `,
          // Estilos customizados para toolbar compacta
          skin: 'oxide',
          content_css: 'default',
          // Configurações de interface compacta
          elementpath: false,
          resize: false,
          // Reduzir tamanho dos botões e espaçamento
          toolbar_groups: {
            formatting: {
              icon: 'bold',
              tooltip: 'Formatting',
              items: 'bold italic underline strikethrough | forecolor backcolor'
            },
            alignment: {
              icon: 'align-left',
              tooltip: 'Alignment',
              items: 'alignleft aligncenter alignright alignjustify'
            },
            lists: {
              icon: 'list-ul',
              tooltip: 'Lists',
              items: 'bullist numlist outdent indent'
            },
            insert: {
              icon: 'plus',
              tooltip: 'Insert',
              items: 'link image media table'
            },
            tools: {
              icon: 'tools',
              tooltip: 'Tools',
              items: 'code preview fullscreen help'
            }
          },
          // Configurações de imagem
          image_advtab: false,
          image_uploadtab: false,
          file_picker_types: 'image',
          
          // Configurações de texto
          font_formats: 'Arial=arial,helvetica,sans-serif; Georgia=georgia,serif; Times New Roman=times new roman,times,serif; Courier New=courier new,courier,monospace; Verdana=verdana,sans-serif',
          fontsize_formats: '8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt',
          
          // Configurações de código
          code_dialog_width: 800,
          code_dialog_height: 600,
          
          // Validação e limpeza - DESABILITAR processamento automático
          extended_valid_elements: 'img[src|alt|style|width|height|class|id|title],iframe[src|width|height|name|align|class|frameborder|scrolling|marginheight|marginwidth]',
          relative_urls: false,
          remove_script_host: true,
          convert_urls: false,
          // Configurações de limpeza
          cleanup: false,
          cleanup_on_startup: false,
          
          // Estilos válidos
          valid_styles: {
            '*': 'width,max-width,height,max-height,float,margin,padding,text-align,color,background-color,border,border-radius'
          },
          
          // Configurações de paste
          paste_auto_cleanup_on_paste: false,
          paste_remove_styles: false,
          paste_remove_styles_if_webkit: false,
          paste_enable_default_filters: false,
          
          // Configurações de performance
          browser_spellcheck: true,
          contextmenu: false,
          
          // Configurações de acessibilidade
          accessibility_focus: true,
          accessibility_warnings: true,
          

        }}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
}
