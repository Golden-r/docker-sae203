function isPageReload()
{
    const navEntries = typeof performance !== 'undefined' && performance.getEntriesByType ? performance.getEntriesByType('navigation') : [];
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
        return true;
    }
    return typeof performance !== 'undefined' && performance.navigation && performance.navigation.type === 1;
}

document.addEventListener('DOMContentLoaded', () =>
{
    // Forcer la reconnexion sur un refresh en invalidant le cache Basic Auth du navigateur
    if (sessionStorage.getItem('force_relogin'))
    {
        sessionStorage.removeItem('force_relogin');
    }
    /*else if (isPageReload())
    {
        sessionStorage.setItem('force_relogin', '1');
        // Envoyer des identifiants invalides pour écraser ceux mis en cache par le navigateur
        fetch('check_auth.php',
        {
            headers:{ 'Authorization': 'Basic ' + btoa('logout:logout') }
        }).catch(() => {}).then(() =>
        {
            location.reload();
        });

        return;
    }*/

    const dropZone     = document.getElementById('drop-zone')    ;
    const fileInput    = document.getElementById('file-input')   ;
    const uploadResult = document.getElementById('upload-result');
    const fileList     = document.getElementById('file-list')    ;
    const authStatus   = document.getElementById('auth-status')  ;

    let isAuthenticated = false;

    // Load available files on page load
    chargerFichiers();

    // Drag & drop events
    if (dropZone)
    {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) =>
        {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () =>
        {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) =>
        {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0)
            {
                uploadFile(files[0]);
            }
        });
    }

    if (fileInput)
    {
        fileInput.addEventListener('change', () =>
        {
            if (fileInput.files.length > 0) {
                uploadFile(fileInput.files[0]);
            }
        });
    }

    async function uploadFile(file)
    {
        uploadResult.innerHTML = '<p class="info">Envoi en cours...</p>';

        const formData = new FormData();
        formData.append('file', file);

        try
        {
            const response = await fetch('upload.php',
            {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success)
            {
                uploadResult.innerHTML = `
                    <div class="success-box">
                        <p><strong>Fichier envoyé avec succès !</strong></p>
                        <p>Lien de téléchargement (nécessite une connexion) :</p>
                        <div class="link-box">
                            <a href="${data.link}" target="_blank">${data.link}</a>
                            <button onclick="copyToClipboard('${data.link}')">Copier</button>
                        </div>
                    </div>
                `;
                chargerFichiers(); // Refresh file list
            }
            else
            {
                uploadResult.innerHTML = `<p class="error">Erreur : ${data.error || 'Échec de l\'envoi'}</p>`;
            }
        }
        catch (err)
        {
            uploadResult.innerHTML = `<p class="error">Erreur réseau : ${err.message}</p>`;
        }
    }

    async function chargerFichiers()
    {
        if (!fileList) return;
        fileList.innerHTML = '<li>Chargement...</li>';

        try
        {
            const response = await fetch('files.php',
            {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success)
            {
                isAuthenticated = data.authenticated;
                updateAuthStatus();

                if (data.files.length > 0)
                {
                    fileList.innerHTML = '';
                    data.files.forEach(file => {
                        const sizeStr = formatBytes(file.size);
                        const li = document.createElement('li');
                        li.className = 'file-item';

                        if (isAuthenticated && file.url) {
                            // rayan: ça si on est authentifié;;; lien de téléchargement + bouton supprimer
                            li.innerHTML = `
                                <div class="file-info">
                                    <a href="${file.url}" title="Télécharger ${file.name}">
                                        📄 ${file.name}
                                    </a>
                                    <span class="meta">${sizeStr} — ${file.date}</span>
                                </div>
                                <button class="delete-btn" data-file="${file.name}" title="Supprimer">
                                    🗑️ Supprimer
                                </button>
                            `;
                        }
                        else
                        {
                            // rayan: non authentifié;;; nom sans lien
                            li.innerHTML = `
                                <div class="file-info">
                                    <span class="file-name">📄 ${file.name}</span>
                                    <span class="meta">${sizeStr} — ${file.date}</span>
                                </div>
                                <button class="login-btn" onclick="promptLogin()" title="Se connecter pour télécharger">
                                    🔒 Connexion
                                </button>
                            `;
                        }
                        fileList.appendChild(li);
                    });

                    // Attacher les événements de suppression
                    document.querySelectorAll('.delete-btn').forEach(btn =>
                    {
                        btn.addEventListener('click', (e) =>
                        {
                            const filename = e.target.dataset.file;
                            deleteFile(filename);
                        });
                    });
                }
                else
                    {
                    fileList.innerHTML = '<li>Aucun fichier disponible pour le moment.</li>';
                }
            }
            else
            {
                fileList.innerHTML = '<li>Erreur lors du chargement des fichiers.</li>';
            }
        }
        catch (err)
        {
            fileList.innerHTML = `<li class="error">Impossible de charger la liste des fichiers. :(</li>`;
        }
    }

    async function deleteFile(filename)
    {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer "${filename}" ?`)) {
            return;
        }

        try
        {
            const response = await fetch('delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ file: filename })
            });

            if (response.status === 401)
            {
                alert('Vous devez être connecté pour supprimer un fichier.');
                promptLogin();
                return;
            }

            const data = await response.json();

            if (data.success) {
                chargerFichiers(); // Refresh list
            } else {
                alert('Erreur : ' + (data.error || 'Échec de la suppression'));
            }
        } catch (err) {
            alert('Erreur réseau : ' + err.message);
        }
    }

    function updateAuthStatus() {
        if (!authStatus) return;
        if (isAuthenticated) {
            authStatus.innerHTML = '<span class="auth-badge auth-ok">Connecté</span>';
        } else {
            authStatus.innerHTML = '<span class="auth-badge auth-ko">Non connecté</span> <button onclick="promptLogin()" class="small-btn">Se connecter</button>';
        }
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 octets';
        const k = 1024;
        const sizes = ['octets', 'Ko', 'Mo', 'Go'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Expose promptLogin globally
    window.promptLogin = function() {
        // Déclencher l'authentification Basic en appelant un endpoint protégé
        fetch('check_auth.php', { credentials: 'include' })
            .then(response => {
                if (response.status === 401) {
                    // Le navigateur va afficher la popup d'authentification
                    // Après auth, on recharge la liste
                    setTimeout(chargerFichiers, 500);
                } else if (response.ok) {
                    chargerFichiers();
                }
            })
            .catch(() => {
                chargerFichiers();
            });
    };
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

