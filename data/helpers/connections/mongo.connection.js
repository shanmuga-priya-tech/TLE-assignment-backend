import mongoose from "mongoose";
const { connect, connection } = mongoose;

const disconnectOnAppQuit = async () => {
  try {
    process.on("SIGINT", async () => {
      await connection.close();
      console.log("Mongoose disconnected on app termination");
      process.exit(0);
    });
    process.on("SIGUSR2", async () => {
      await connection.close();
      console.log("Mongoose disconnected on app termination");
      process.exit(0);
    });
  } catch (error) {
    console.log(
      "Error while trying to disconnect mongo while application closure"
    );
    console.error(error);
  }
};

export const connectDB = async () => {
    try {
        const connectionString = `mongodb://${encodeURIComponent(
            process.env.DB_USER
        )}:${encodeURIComponent(process.env.DB_PWD)}@${process.env.DB_HOST}:${
            process.env.DB_PORT
        }/${process.env.DB_NAME}?authSource=${process.env.AUTH_SOURCE_DB}`;

        await connect(connectionString, {});
        console.log(
            `DB connected successfully : ${process.env.DB_NAME} :: connectDB()`
        );
        await disconnectOnAppQuit();        
    } catch (error) {
        console.error("Error while connecting to DB :: connectDB()");
        console.error(error);
        throw Error(error)
    }
}