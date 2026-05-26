import axios from 'axios';

window.axios = axios;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// CSRF vía cookie XSRF-TOKEN: ver resources/js/api/client.js (Sanctum)
