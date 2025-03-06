const myCli = require("my-node-wrapper");

export default async function handler(req, res) {
  const { action } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (action === 'connect') {
    console.log("Connecting...");

    // Test the connect function
    myCli.connect((err, output) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Failed to connect' });
      } else {
        console.log("output from connect api", output);
        return res.status(200).json({ message: 'Connected successfully' });
      }
    });

  } else if (action === 'disconnect') {
    console.log("Disconnecting...");

    // Test the disconnect function
    myCli.disconnect((err, output) => {  // Corrected to use disconnect
      if (err) {
        console.error("Error during disconnect:", err);
        return res.status(500).json({ error: 'Failed to disconnect' });
      } else {
        console.log("output from dis api:", output);
        return res.status(200).json({ message: 'Disconnected successfully' });
      }
    });

  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }
}
