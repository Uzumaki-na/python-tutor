interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<any>;
  loadPackage: (pkg: string) => Promise<void>;
}

declare global {
  interface Window {
    loadPyodide: () => Promise<PyodideInterface>;
  }
}

let pyodide: PyodideInterface | null = null;

export async function initializePyodide(): Promise<PyodideInterface> {
  if (!pyodide) {
    // Load Pyodide script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
    document.head.appendChild(script);

    await new Promise((resolve) => {
      script.onload = resolve;
    });

    pyodide = await window.loadPyodide();
  }
  return pyodide;
}

export async function executePythonCode(code: string): Promise<{
  output: string;
  error: string | null;
}> {
  try {
    const py = await initializePyodide();
    
    // Set up stdout capture
    await py.runPythonAsync(`
      import sys
      import io
      sys.stdout = io.StringIO()
    `);

    // Execute the code
    await py.runPythonAsync(code);
    
    // Get captured output
    const output = await py.runPythonAsync('sys.stdout.getvalue()');

    return {
      output: output as string,
      error: null,
    };
  } catch (error: any) {
    return {
      output: '',
      error: error.message || 'An error occurred while executing the code',
    };
  }
}