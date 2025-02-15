export async function convertTextToSpeech(text) {
    const apiUrl = 'http://localhost:8000/api/textToSpeech'; // adjust if your API endpoint path is different
  
    const payload = { text };
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Conversion successful. File name:', data.file_name);
      return data.file_name;
    } catch (error) {
      console.error('Error during text-to-speech conversion:', error);
      return null;
    }
  }
  