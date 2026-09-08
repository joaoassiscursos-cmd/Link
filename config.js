// ==========================================
// CONFIGURAÇÃO DO FIREBASE
// Substitua com seus dados do Firebase Console
// ==========================================

export const firebaseConfig = {
  apiKey: "AIzaSyCWlMxdEEJ3ghJmczYGI0B0OK0Kaku1QtE",
  authDomain: "balcao-a3363.firebaseapp.com",
  projectId: "balcao-a3363",
  storageBucket: "balcao-a3363.firebasestorage.app",
  messagingSenderId: "696763021614",
  appId: "1:696763021614:web:f568acd4c637a79027a2bf"
};

// ==========================================
// COMO CONFIGURAR:
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto
// 3. Vá em Configurações do Projeto > Seus apps
// 4. Adicione um app Web e copie as credenciais
// 5. Cole aqui em cima
// ==========================================

// Configurações adicionais do app
export const APP_CONFIG = {
    // Domínio onde o app vai rodar (ex: meusite.com)
    domain: window.location.hostname,
    
    // Nome do app
    appName: "EncurtaLink",
    
    // Limites do plano gratuito
    freeLimits: {
        maxLinks: 100,
        analyticsDays: 7
    },
    
    // Planos
    plans: {
        free: {
            name: "Gratuito",
            price: 0,
            maxLinks: 100,
            analyticsDays: 7,
            customDomain: false,
            teamMembers: 1
        },
        pro: {
            name: "Pro",
            price: 29,
            maxLinks: Infinity,
            analyticsDays: 365,
            customDomain: false,
            teamMembers: 1
        },
        enterprise: {
            name: "Empresarial",
            price: 97,
            maxLinks: Infinity,
            analyticsDays: 365,
            customDomain: true,
            teamMembers: 10
        }
    }
};