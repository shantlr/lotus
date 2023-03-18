import dayjs from 'dayjs';
import { useState } from 'react';
import { Button } from '../base/button';
import { Input } from '../base/input';

export const CreateTaskPane = ({ onClose }: { onClose?: () => void }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState<string>(() =>
    dayjs().format('YYYY-MM-DDTHH:mm')
  );
  const [end, setEnd] = useState<string>(() =>
    dayjs().format('YYYY-MM-DDTHH:mm')
  );

  return (
    <div className="w-full border-l-2 border-l-gray-900 px-8 py-2">
      <div
        onClick={() => {
          onClose?.();
        }}
      >
        X
      </div>
      <div className="pt-4">
        <Input
          value={title}
          onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
          placeholder="Title"
        />
      </div>
      <div className="pt-2">
        <span className="inline-block w-[50px]">Start</span>
        <Input
          type="datetime-local"
          value={start}
          onChange={(e) => {
            setStart(e.target.value);
          }}
        />
      </div>
      <div className="pt-2">
        <span className="inline-block w-[50px]">End</span>
        <Input
          type="datetime-local"
          value={end}
          onChange={(e) => {
            setEnd(e.target.value);
          }}
        />
      </div>
      <div>
        <Button disabled={!title || !start || !end} className="mt-2">
          Create task
        </Button>
      </div>
    </div>
  );
};
