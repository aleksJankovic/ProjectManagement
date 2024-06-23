export const environment = {
  production: true,
  apiUrl: 'http://softeng.pmf.kg.ac.rs:10141/api',
};

if (environment.production) {
  if (window) {
    window.console.log = function() {};
    window.console.warn = function() {};
    window.console.info = function() {};
    window.console.debug = function() {};
  }
}
