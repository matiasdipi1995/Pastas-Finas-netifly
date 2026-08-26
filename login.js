document.addEventListener("DOMContentLoaded", function(){

    const logueado = localStorage.getItem("logueado");
    
    const usuarioBtn = document.getElementById("usuarioBtn");
    const menuUsuario = document.getElementById("menuUsuario");
    const nombreUsuario = document.getElementById("nombreUsuario");
    const cerrarSesion = document.getElementById("cerrarSesion");

    if(logueado){
        nombreUsuario.textContent = logueado;
        usuarioBtn.addEventListener("click", function(e){
            e.preventDefault();
            menuUsuario.classList.toggle("activo");
        });

        cerrarSesion.addEventListener("click", function(e){
            e.preventDefault();
            localStorage.removeItem("logueado");
            window.location.href = "index.html";
        });

    }else{

    menuUsuario.style.display = "none";
    usuarioBtn.addEventListener("click", function(){
        window.location.href = "login_admin.html";
    });
}

    document.addEventListener("click", function(e){

        if(
            menuUsuario &&
            !usuarioBtn.contains(e.target) &&
            !menuUsuario.contains(e.target)
        ){
            menuUsuario.classList.remove("activo");
        }

    });

});