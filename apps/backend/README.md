## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd <project-directory>
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up the environment variables:
   Create a `.env` file in the root directory with the following contents:

   ```env
   JWT_SECRET=<your-jwt-secret>
   MONGO_URI = <mongodb-uri>
   PORT = <PORT>
   ```

   Note - MongoDb URI should be only base URL.

5. Start the server:
   ```bash
   npm run dev
   ```