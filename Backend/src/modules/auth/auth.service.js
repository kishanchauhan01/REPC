import { db } from "../../configs/db.js";
import { DbResponse } from "../../utils/DbResponse.js";

const findUser = async (email) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rowCount == 1) {
      return DbResponse.dbSuccess(result.rows[0]);
    } else if (result.rowCount > 1) {
      return DbResponse.dbError(
        `User with ${email} is present more then one. (User Invalid)`
      );
    } else {
      return DbResponse.dbError(`User with ${email} is not present in record`);
    }
  } catch (error) {
    console.error(error);

    return DbResponse.dbError(
      error?.message || "Something went wrong while finding user"
    );
  }
};

export { findUser };
