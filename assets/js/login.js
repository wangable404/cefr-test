document.addEventListener('DOMContentLoaded', () => {
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const loginForm = document.getElementById('loginForm');
    const userInfoDiv = document.getElementById('userInfo');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');

    const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';

    checkExistingUser();

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    }

    function handleGoogleSignIn() {

        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: false
            });
            

            google.accounts.id.prompt();
        } else {

            openGoogleOAuthPopup();
        }
    }

    function handleCredentialResponse(response) {

        const responsePayload = decodeJWT(response.credential);
        
        if (responsePayload) {

            localStorage.setItem('googleUser', JSON.stringify({
                name: responsePayload.name,
                email: responsePayload.email,
                picture: responsePayload.picture,
                sub: responsePayload.sub
            }));
            

            displayUserInfo(responsePayload);
            

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    function decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    }

    function displayUserInfo(user) {

        if (loginForm) loginForm.style.display = 'none';
        if (googleSignInBtn) googleSignInBtn.style.display = 'none';
        

        if (userInfoDiv) {
            userInfoDiv.style.display = 'flex';
            if (userAvatar) {
                userAvatar.src = user.picture || 'https://via.placeholder.com/80';
            }
            if (userName) {
                userName.textContent = user.name || 'User';
            }
            if (userEmail) {
                userEmail.textContent = user.email || '';
            }
        }
    }

    function openGoogleOAuthPopup() {

        const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
            'client_id=' + GOOGLE_CLIENT_ID +
            '&redirect_uri=' + encodeURIComponent(window.location.origin + window.location.pathname.replace('login.html', 'index.html')) +
            '&response_type=token' +
            '&scope=openid%20email%20profile' +
            '&include_granted_scopes=true';

        const width = 500;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        window.open(authUrl, 'Google Sign In', 
            'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left);
    }

    function checkExistingUser() {

        const googleUserStr = localStorage.getItem('googleUser');
        if (googleUserStr) {
            try {
                const googleUser = JSON.parse(googleUserStr);
                displayUserInfo(googleUser);
            } catch (e) {
                localStorage.removeItem('googleUser');
            }
        }


        const savedName = localStorage.getItem('userName');
        const savedSurname = localStorage.getItem('userSurname');
        const currentPage = window.location.pathname.split("/").pop() || "login.html";

        if ((savedName && savedSurname) && currentPage === "login.html") {
            window.location.href = "index.html";
            return;
        }
    }


    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const surname = document.getElementById('surname').value.trim();
            const name = document.getElementById('name').value.trim();

            if (!name || !surname) {
                alert("Enter name and surname");
                return;
            }


            localStorage.removeItem('googleUser');
            

            localStorage.setItem("userName", name);
            localStorage.setItem("userSurname", surname);

            window.location.href = "index.html";
        });
    }


    function handleOAuthCallback() {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            
            if (accessToken) {

                fetch('https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + accessToken)
                    .then(res => res.json())
                    .then(userData => {
                        localStorage.setItem('googleUser', JSON.stringify({
                            name: userData.name,
                            email: userData.email,
                            picture: userData.picture,
                            sub: userData.sub
                        }));
                        

                        window.location.hash = '';
                        window.location.href = 'index.html';
                    })
                    .catch(err => {
                        console.error('Error fetching user info:', err);
                    });
            }
        }
    }


    handleOAuthCallback();
});
