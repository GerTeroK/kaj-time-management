

export const userStore = {
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    setUser(userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    },
    clearUser() {
        localStorage.removeItem('user');
    },
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },
    getToken() {
        return localStorage.getItem('token');
    },
    setToken(token) {
        localStorage.setItem('token', token);
    },
    clearToken() {
        localStorage.removeItem('token');
    },
}