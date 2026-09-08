// ==========================================
// APP.JS - Lógica principal do EncurtaLink
// ==========================================

import { 
    getAuth, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from './config.js';

// ==========================================
// INICIALIZAÇÃO
// ==========================================
const auth = getAuth();
const db = getFirestore();

// ==========================================
// GERAR CÓDIGO ALEATÓRIO
// ==========================================
function generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ==========================================
// ENCURTAR LINK
// ==========================================
export async function encurtarLink(urlOriginal, userId) {
    try {
        // Validar URL
        if (!urlOriginal.startsWith('http://') && !urlOriginal.startsWith('https://')) {
            urlOriginal = 'https://' + urlOriginal;
        }

        // Gerar código único
        let codigo = generateShortCode(6);
        let existe = true;
        let tentativas = 0;

        // Garantir código único
        while (existe && tentativas < 5) {
            const q = query(
                collection(db, 'links'),
                where('codigo', '==', codigo)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                existe = false;
            } else {
                codigo = generateShortCode(7);
                tentativas++;
            }
        }

        // Salvar no Firebase
        const docRef = await addDoc(collection(db, 'links'), {
            codigo: codigo,
            urlOriginal: urlOriginal,
            urlEncurtada: `${window.location.origin}/${codigo}`,
            usuarioId: userId,
            criadoEm: serverTimestamp(),
            cliques: 0,
            ativo: true,
            titulo: urlOriginal.substring(0, 50),
            ultimoClique: null
        });

        return {
            success: true,
            codigo: codigo,
            urlEncurtada: `${window.location.origin}/${codigo}`,
            id: docRef.id
        };

    } catch (error) {
        console.error('Erro ao encurtar:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ==========================================
= LISTAR LINKS DO USUÁRIO
// ==========================================
export function listarLinksUsuario(userId, callback) {
    const q = query(
        collection(db, 'links'),
        where('usuarioId', '==', userId),
        orderBy('criadoEm', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const links = [];
        snapshot.forEach((doc) => {
            links.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(links);
    });
}

// ==========================================
= DELETAR LINK
// ==========================================
export async function deletarLink(linkId, userId) {
    try {
        const linkRef = doc(db, 'links', linkId);
        await deleteDoc(linkRef);
        return { success: true };
    } catch (error) {
        console.error('Erro ao deletar:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
= ATUALIZAR LINK (editar título, etc)
// ==========================================
export async function atualizarLink(linkId, userId, dados) {
    try {
        const linkRef = doc(db, 'links', linkId);
        await updateDoc(linkRef, dados);
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
= REGISTRAR CLIQUE
// ==========================================
export async function registrarClique(codigo, dadosClique) {
    try {
        // Buscar link pelo código
        const q = query(
            collection(db, 'links'),
            where('codigo', '==', codigo)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return { success: false, error: 'Link não encontrado' };
        }

        const linkDoc = snapshot.docs[0];
        const linkData = linkDoc.data();

        // Incrementar contador de cliques
        await updateDoc(linkDoc.ref, {
            cliques: (linkData.cliques || 0) + 1,
            ultimoClique: serverTimestamp()
        });

        // Registrar detalhes do clique
        await addDoc(collection(db, 'cliques'), {
            linkId: linkDoc.id,
            codigo: codigo,
            timestamp: serverTimestamp(),
            ip: dadosClique.ip || 'desconhecido',
            userAgent: dadosClique.userAgent || navigator.userAgent,
            dispositivo: dadosClique.dispositivo || getDispositivo(),
            cidade: dadosClique.cidade || 'desconhecida',
            pais: dadosClique.pais || 'desconhecido',
            navegador: dadosClique.navegador || getNavegador(),
            sistemaOperacional: dadosClique.sistemaOperacional || getSO()
        });

        return {
            success: true,
            urlOriginal: linkData.urlOriginal,
            linkId: linkDoc.id
        };

    } catch (error) {
        console.error('Erro ao registrar clique:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
= UTILITÁRIOS DE DETECÇÃO
// ==========================================
function getDispositivo() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'Smartphone';
    }
    return 'Desktop';
}

function getNavegador() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Outro';
}

function getSO() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Outro';
}

// ==========================================
= EXPORTAR FUNÇÕES PARA O WINDOW
// ==========================================
window.encurtarLink = encurtarLink;
window.listarLinksUsuario = listarLinksUsuario;
window.deletarLink = deletarLink;
window.atualizarLink = atualizarLink;
window.registrarClique = registrarClique;

// ==========================================
= VERIFICAR AUTENTICAÇÃO
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Usuário logado:', user.email);
        window.usuarioAtual = user;
    } else {
        console.log('Usuário não logado');
        window.usuarioAtual = null;
    }
});