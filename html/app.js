document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadResult = document.getElementById('upload-result');
    const fileList = document.getElementById('file-list');

    // Load available files on page load
    loadFiles();

    // Drag & drop events
    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                uploadFile(files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                uploadFile(fileInput.files[0]);
            }
        });
    }

    async function uploadFile(file) {
        uploadResult.innerHTML = '<p class="info">Envoi en cours...</p>';

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('upload.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                uploadResult.innerHTML = `
                    <div class="success-box">
                        <p><strong>Fichier envoyé avec succès !</strong></p>
                        <p>Lien de téléchargement :</p>
                        <div class="link-box">
                            <a href="${data.link}" target="_blank" download>${data.link}</a>
                            <button onclick="copyToClipboard('${data.link}')">Copier</button>
                        </div>
                    </div>
                `;
                loadFiles(); // Refresh file list
            } else {
                uploadResult.innerHTML = `<p class="error">Erreur : ${data.error || 'Échec de l\'envoi'}</p>`;
            }
        } catch (err) {
            uploadResult.innerHTML = `<p class="error">Erreur réseau : ${err.message}</p>`;
        }
    }

    async function loadFiles() {
        if (!fileList) return;
        fileList.innerHTML = '<li>Chargement...</li>';

        try {
            const response = await fetch('files.php');
            const data = await response.json();

            if (data.success && data.files.length > 0) {
                fileList.innerHTML = '';
                data.files.forEach(file => {
                    const sizeStr = formatBytes(file.size);
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a href="${file.url}" download title="Télécharger ${file.name}">
                            📄 ${file.name}
                        </a>
                        <span class="meta">${sizeStr} — ${file.date}</span>
                    `;
                    fileList.appendChild(li);
                });
            } else {
                fileList.innerHTML = '<li>Aucun fichier disponible pour le moment.</li>';
            }
        } catch (err) {
            fileList.innerHTML = `<li class="error">Impossible de charger la liste des fichiers.</li>`;
        }
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 octets';
        const k = 1024;
        const sizes = ['octets', 'Ko', 'Mo', 'Go'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Lien copié dans le presse-papiers !');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Lien copié dans le presse-papiers !');
    });
}

