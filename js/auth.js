const baseURL =  "https://kid-clothes-store.onrender.com/api/v1";
//Register
export async function register(usersData){
    try {
            const respone = await fetch(`${baseURL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usersData)
        });

        const data = await respone.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        return { code: 500, message: "Lỗi kết nối đến server" };
    }

}

//Login
export async function login(loginData){
    try {
        const respone = await fetch(`${baseURL}/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const data = await respone.json();
        return data;
    } catch (error) {
        console.error("Login error:", error);
        return {code: 500, message: "Lỗi sever"};
    }
}

