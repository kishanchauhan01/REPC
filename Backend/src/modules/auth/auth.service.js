import { db } from "../../configs/db.js";
import { DbResponse } from "../../utils/DbResponse.js";

/**
 * Retrieves a user from the database by their email address.
 *
 * @param {string} email - The email address of the user to find.
 * @returns {Promise<DbResponse>} A promise that resolves to a DbResponse object.
 *   - Success: Contains the user object if exactly one match is found.
 *   - Error: Contains an error message if multiple users, no users, or a DB error occurs.
 */
const findUserByEmail = async (email) => {
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

/**
 * Retrieves a user from the database by their unique identifier.
 *
 * @param {string} id - The unique identifier of the user to find.
 * @returns {Promise<DbResponse>} A promise that resolves to a DbResponse object.
 *   - Success: Contains the user object if exactly one match is found.
 *   - Error: Contains an error message if multiple users, no users, or a DB error occurs.
 */
const findUserById = async (id) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rowCount == 1) {
      return DbResponse.dbSuccess(result.rows[0]);
    } else if (result.rowCount > 1) {
      return DbResponse.dbError(
        `User with ${id} is present more then one. (User Invalid)`
      );
    } else {
      return DbResponse.dbError(`User with ${id} is not present in record`);
    }
  } catch (error) {
    console.error(error);

    return DbResponse.dbError(
      error?.message || "Something went wrong while finding user"
    );
  }
};

export { findUserByEmail, findUserById };
