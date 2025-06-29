document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const userInput = document.getElementById('userInput');
    const inputSection = document.getElementById('input-section');
    const resultDiv = document.getElementById('playlistResult');
    const loader = document.getElementById('loader');

    generateBtn.addEventListener('click', async () => {
        const userPrompt = userInput.value.trim();

        if (!userPrompt) {
            alert('Please describe the playlist you want!');
            return;
        }

        // Hide form, show loader
        inputSection.classList.add('hidden');

        // loader
        let index = 0;
        const msg = "🎧 Crafting  your  playlist  . . .";
        loader.classList.remove('hidden');
        loader.innerText="";

        function typeLoaderText(text, el, speed = 25) {
            if (index < text.length) {
                el.innerText += text.charAt(index);
                index++;
                setTimeout(() => typeLoaderText(text, el, speed), speed);
            }
        }
        typeLoaderText(msg, loader);

        resultDiv.classList.add('hidden');

        try {
            const response = await fetch('http://localhost:3000/generate-playlist', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput: userPrompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong on the server.');
            }

            const data = await response.json();
            displayPlaylist(data);

        } catch (error) {
            alert(`Error: ${error.message}`);
            inputSection.classList.remove('hidden');
        } finally {
            // Hide loader
            loader.classList.add('hidden');
        }
    });

    function displayPlaylist(data) {
        let htmlContent = `
            <h2 class="playlist-title">${data.playlistName}</h2>
            <p class="playlist-description">${data.description}</p>
            <ul>
        `;

        data.songs.forEach(song => {
            htmlContent += `<li class="song-item">
                <img src="images/blue_vinyl.png" alt="Spinning vinyl" class="vinyl spinning-record">
                <div class="song-details">
                    <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist)}" target="_blank">
                        <strong>${song.title}</strong>
                    </a><br>
                    <em>${song.artist}</em>
                </div>
            </li>`;
        });

        htmlContent += `</ul>`

        // Add button to generate a new playlist
        htmlContent += `
        <div id="buttonContainer">
            <button id="backBtn">Generate Another Playlist </button>
            <button id="retryBtn">Try Again With Same Prompt </button>
        </div>
        `;


        resultDiv.innerHTML = htmlContent;

        // Show results
        resultDiv.classList.remove('hidden');

        // Add event listener for the new back button 
        document.getElementById('backBtn').addEventListener('click', () => {
            resultDiv.classList.add('hidden');
            inputSection.classList.add('hidden');
            userInput.value =' '; // Clear text area
        });

        // Add event list for retry button
        document.getElementById('retryBtn').addEventListener('click', () => {
            generateBtn.click();
        });
    }
});