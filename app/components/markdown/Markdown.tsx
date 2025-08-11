import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Define props interface
interface MarkdownProps {
  label: string;
  value: string;
  onChange: (data: string) => void;
  onClick?: (e: React.MouseEvent) => void;
}

class Base64UploadAdapter {
  private loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then((file: File) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ default: reader.result });
        };
        reader.onerror = () => reject(reader.error);
        reader.onabort = () => reject();
        reader.readAsDataURL(file);
      });
    });
  }

  abort() {}
}

// Markdown Component
const Markdown = ({ label, value, onChange, onClick }: MarkdownProps) => {
  return (
    <div className="w-full flex flex-col justify-start items-start gap-4" onClick={onClick}>
      <p className="text-lg">{label}</p>
      <div className="w-full">
        <CKEditor
          editor={ClassicEditor}
          data={value || ''} 
          onReady={(editor) => {
            editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
              return new Base64UploadAdapter(loader);
            };
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            onChange(data);
          }}
          config={{
            licenseKey: 'GPL',
            toolbar: {
              items: [
                'heading', '|',
                'bold', 'italic', 'underline', 'link', '|',
                'bulletedList', 'numberedList', '|',
                'uploadImage', 'mediaEmbed', '|',
                'undo', 'redo'
              ],
              shouldNotGroupWhenFull: true
            },
            image: {
              resizeUnit: '%',
              resizeOptions: [
                {
                  name: 'imageResize:original',
                  value: null,
                  label: 'Original'
                },
                {
                  name: 'imageResize:25',
                  value: '25',
                  label: '25%'
                },
                {
                  name: 'imageResize:50',
                  value: '50',
                  label: '50%'
                },
                {
                  name: 'imageResize:75',
                  value: '75',
                  label: '75%'
                }
              ],
              toolbar: [
                'imageStyle:inline',
                'imageStyle:block',
                'imageStyle:side',
                '|',
                'imageResize:25',
                'imageResize:50',
                'imageResize:75',
                'imageResize:original',
                '|',
                'toggleImageCaption',
                'imageTextAlternative'
              ]
            }
          }}
        />
      </div>
    </div>
  );
};

export default Markdown;
