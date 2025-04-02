const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

//const axios = require("axios");

app.get("/api/signal", async (req, res) => {
  try {
    const { start, end, duration, currency_pairs } = req.query;

    const apiUrl = `https://alltradingapi.com/signal_list_gen_vip/qx_api?start=${encodeURIComponent(
      start
    )}&end=${encodeURIComponent(end)}&duration=${encodeURIComponent(
      duration
    )}&currency_pairs=${encodeURIComponent(
      currency_pairs
    )}&operation_mode=normal&percentage_min=75&apply_filter=1&is_separate=1&backtest_advanced=off`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    // Transform response
    const patchedResponse = {
      execution_details: {
        execution_time: data.detalhes_execucao.tempo_execucao,
        timezone: data.detalhes_execucao.fuso_horario,
        date: data.detalhes_execucao.data,
        creator: data.detalhes_execucao.criador,
      },
      signals: data.signals.map((signal) => ({
        asset: signal.ativos.replace("_otc", ""), // Convert "BRLUSD_otc" to "BRLUSD"
        entry_time: signal.entrada,
        main_direction: signal.direcao_principal === "put" ? "sell" : "buy", // Translate "put" to "sell" and "call" to "buy"
        owner: "prime",
      })),
    };

    res.json(patchedResponse);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});


// API proxy endpoint to avoid CORS issues
app.get("/api/signals", async (req, res) => {
  try {
    const { start, end, duration, currency_pairs } = req.query;

    // Construct API URL with user inputs and default parameters
    const apiUrl = `https://alltradingapi.com/signal_list_gen_vip/qx_api?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&duration=${encodeURIComponent(duration)}&currency_pairs=${encodeURIComponent(currency_pairs)}&operation_mode=normal&percentage_min=75&apply_filter=1&is_separate=1&backtest_advanced=off`;

    // Fetch data from the external API
    const response = await axios.get(apiUrl);

    res.json(response.data); // Send data to the client
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// Serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
