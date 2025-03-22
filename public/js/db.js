let db;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("PsicologoAppDB", 2);

        request.onupgradeneeded = function(event) {
            db = event.target.result;

            // Criar object stores se não existirem
            if (!db.objectStoreNames.contains('psicologos')) {
                db.createObjectStore('psicologos', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('pacientes')) {
                db.createObjectStore('pacientes', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('ats')) {
                db.createObjectStore('ats', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('relacionamentos')) {
                db.createObjectStore('relacionamentos', { keyPath: 'id', autoIncrement: true });
            }

            console.log("Object stores criados com sucesso!");
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            console.log("Banco de dados aberto com sucesso!");
            resolve(db); // Resolve a Promise com o banco de dados
        };

        request.onerror = function(event) {
            console.error("Erro ao abrir o banco de dados:", event.target.errorCode);
            reject(event.target.error);
        };
    });
}

function getAllData(storeName, callback) {
    if (!db) {
        console.error("Banco de dados não inicializado.");
        return;
    }

    if (!db.objectStoreNames.contains(storeName)) {
        console.error(`Object store "${storeName}" não encontrado.`);
        return;
    }

    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = function(event) {
        callback(event.target.result);
    };

    request.onerror = function(event) {
        console.error("Erro ao buscar dados:", event.target.errorCode);
    };
}

function addData(storeName, data, onSuccess, onError) {
    if (!db) {
        console.error("Banco de dados não inicializado.");
        if (onError) onError("Banco de dados não inicializado.");
        return;
    }

    if (!db.objectStoreNames.contains(storeName)) {
        console.error(`Object store "${storeName}" não encontrado.`);
        if (onError) onError(`Object store "${storeName}" não encontrado.`);
        return;
    }

    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = function(event) {
        if (onSuccess) onSuccess(event.target.result); // Retorna o ID gerado
    };

    request.onerror = function(event) {
        console.error("Erro ao adicionar dados:", event.target.errorCode);
        if (onError) onError(event.target.error);
    };
}

function deleteData(storeName, id, onSuccess, onError) {
    if (!db) {
        console.error("Banco de dados não inicializado.");
        if (onError) onError("Banco de dados não inicializado.");
        return;
    }

    if (!db.objectStoreNames.contains(storeName)) {
        console.error(`Object store "${storeName}" não encontrado.`);
        if (onError) onError(`Object store "${storeName}" não encontrado.`);
        return;
    }

    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = function(event) {
        if (onSuccess) onSuccess();
    };

    request.onerror = function(event) {
        console.error("Erro ao excluir dados:", event.target.errorCode);
        if (onError) onError(event.target.error);
    };
}

function updateData(storeName, id, newData, onSuccess, onError) {
    if (!db) {
        console.error("Banco de dados não inicializado.");
        if (onError) onError("Banco de dados não inicializado.");
        return;
    }

    if (!db.objectStoreNames.contains(storeName)) {
        console.error(`Object store "${storeName}" não encontrado.`);
        if (onError) onError(`Object store "${storeName}" não encontrado.`);
        return;
    }

    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put({ ...newData, id });

    request.onsuccess = function(event) {
        if (onSuccess) onSuccess(event.target.result);
    };

    request.onerror = function(event) {
        console.error("Erro ao atualizar dados:", event.target.errorCode);
        if (onError) onError(event.target.error);
    };
}

// Inicializa o banco de dados e retorna uma Promise
openDB().then(() => {
    console.log("Banco de dados pronto para uso!");
}).catch((error) => {
    console.error("Erro ao inicializar o banco de dados:", error);
});