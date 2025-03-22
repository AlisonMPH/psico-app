const CACHE_NAME = 'psico-app-v1'; // Nome do cache
const ASSETS_TO_CACHE = [
    '/', // Página principal
    '/cadastro.html', // Página de cadastro
    '/css/styles.css', // Arquivo CSS
    '/js/app.js', // Arquivo JavaScript
    '/js/db.js', // Arquivo JavaScript
    '/image/icon-192x192.png', // Ícone
    '/image/icon-512x512.png', // Ícone
    // Adicione outros arquivos que deseja armazenar em cache
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');

    // Armazena os recursos em cache durante a instalação
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Armazenando recursos em cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => {
                console.error('Falha ao armazenar cache:', error);
            })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
    console.log('Fetch interceptado:', event.request.url);

    event.respondWith(
        caches.match(event.request) // Verifica se o recurso está em cache
            .then((response) => {
                if (response) {
                    console.log('Recurso encontrado em cache:', event.request.url);
                    return response; // Retorna o recurso do cache
                }

                // Se o recurso não estiver em cache, faz a requisição à rede
                return fetch(event.request)
                    .then((response) => {
                        // Verifica se a resposta é válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Armazena a resposta no cache para uso futuro
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});

// Atualização do Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');

    // Remove caches antigos
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});