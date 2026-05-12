import { db } from "../../configs/db.js";

const findUser = async (email) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1",email)
    } catch (error) {
        
    }
}