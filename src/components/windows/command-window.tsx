'use client';

import { useState, useRef, useEffect } from 'react';

export function CommandsWindow() {
    const [history, setHistory] = useState<string[]>([
        'Windows PowerShell',
        'Type "help" to see available commands.',
    ]);
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const runCommand = (cmd: string) => {
        const args = cmd.trim().toLowerCase();

        let output = '';

        switch (args) {
            case 'help':
                output = `
Available commands:
- help
- clear
- date
- echo [text]
- about
        `;
                break;

            case 'date':
                output = new Date().toString();
                break;

            case 'about':
                output = 'This is a custom web OS terminal 😎';
                break;

            case 'clear':
                setHistory([]);
                return;

            default:
                if (args.startsWith('echo ')) {
                    output = cmd.slice(5);
                } else if (args === '') {
                    output = '';
                } else {
                    output = `'${cmd}' is not recognized as a command.`;
                }
        }

        setHistory(prev => [...prev, `> ${cmd}`, output]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            runCommand(input);
            setInput('');
        }
    };

    return (
        <div className=" p-2 bg-black h-full">
            {/* Terminal Header */}
            {/* <div className="pb-4">
                <h2></h2>
            </div> */}
            <div
                className="bg-black text-red-400 font-mono text-sm h-full w-full overflow-auto mt-3"
                onClick={() => inputRef.current?.focus()}
            >
                {/* History */}
                <div className="space-y-1">
                    {history.map((line, index) => (
                        <div key={index} className="whitespace-pre-wrap">
                            {line}
                        </div>
                    ))}
                </div>

                {/* Input line */}
                <div className="flex items-center mt-2">
                    <span className="mr-2">{'>'}</span>
                    <input
                        ref={inputRef}
                        className="bg-transparent outline-none flex-1 text-red-400 caret-red-400"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </div>
        </div>
    );
}