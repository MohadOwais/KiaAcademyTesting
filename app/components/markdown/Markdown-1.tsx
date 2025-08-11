import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface MarkdownProps {
  label: string;
  value: string;
  onChange: (data: string) => void;
  onClick?: (e: React.MouseEvent) => void;
}

const Markdown = ({ label, value, onChange, onClick }: MarkdownProps) => {
  return (
    <div className="w-full flex flex-col justify-start items-start gap-4" onClick={onClick}>
      <p className="text-lg">{label}</p>
      <div className="w-full">
        <CKEditor
          editor={ClassicEditor}
          data={value || ''}
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
                'undo', 'redo'
              ],
              shouldNotGroupWhenFull: true
            }
          }}
        />
      </div>
    </div>
  );
};

export default Markdown;
