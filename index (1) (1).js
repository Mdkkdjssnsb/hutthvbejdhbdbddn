const express = require('express');
const bodyParser = require('body-parser');
const LiaMongo = require('lia-mongo');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Initialize LiaMongo
const liaMongo = new LiaMongo({
  uri: "mongodb+srv://aryankumarg:iuYj*f5m8YsAFCF@goatmart.c64ig7m.mongodb.net/?retryWrites=true&w=majority&appName=GoatMart",
  collection: "myCollection",
  isOwnHost: false,
});

liaMongo.start().then(() => {
  console.log("Connected to MongoDB");

  // API key middleware
  const validApiKeys = ['V-GoatMart-Beta-xv4-Ibs8j-90-az7-V']; // Replace with your actual API keys

  function checkApiKey(req, res, next) {
    const requestApiKey = req.query.apikey;
    if (requestApiKey && validApiKeys.includes(requestApiKey)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Invalid API key' });
    }
  }

  // Routes with API key check
  app.get('/api/items', checkApiKey, async (req, res) => {
    try {
      const entries = await liaMongo.entries();
      res.json(entries.map(entry => entry.value));
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.post('/api/items/bulk', checkApiKey, async (req, res) => {
    try {
      const items = req.body.items; // Expecting an array of items
      if (!Array.isArray(items) || items.length === 0 || items.length > 200) {
        return res.status(400).json({ error: 'Invalid request: Must provide an array of up to 200 items' });
      }

      const entries = await liaMongo.entries();
      const lastItemID = entries.length > 0 ? parseInt(entries[entries.length - 1].key) : 0;
      const newItems = items.map((item, index) => ({
        itemID: lastItemID + index + 1,
        ...item,
        timestamp: new Date().toISOString()
      }));

      // Insert all new items in a single operation
      await Promise.all(newItems.map(item => liaMongo.put(item.itemID.toString(), item)));

      res.status(201).json(newItems);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/items/name/:name', checkApiKey, async (req, res) => {
    try {
      const itemName = req.params.name.toLowerCase();
      const entries = await liaMongo.entries();
      const item = entries.find(entry => entry.value.itemName.toLowerCase() === itemName);
      if (item) {
        res.json(item.value);
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/items/:id', checkApiKey, async (req, res) => {
    try {
      const itemID = req.params.id;
      const item = await liaMongo.get(itemID.toString());
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/items/author/:authorName', checkApiKey, async (req, res) => {
    try {
      const authorName = req.params.authorName;
      const entries = await liaMongo.entries();
      const authorItems = entries.filter(entry => entry.value.authorName === authorName);
      if (authorItems.length > 0) {
        res.json(authorItems.map(entry => entry.value));
      } else {
        res.status(404).json({ error: 'No items found for this author' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/items', checkApiKey, async (req, res) => {
    try {
      const { itemName, description, type, pastebinLink, authorName } = req.body;
      const entries = await liaMongo.entries();
      const itemID = entries.length > 0 ? parseInt(entries[entries.length - 1].key) + 1 : 1;
      const newItem = {
        itemID,
        itemName,
        description,
        type,
        pastebinLink,
        authorName,
        timestamp: new Date().toISOString()
      };
      await liaMongo.put(itemID.toString(), newItem);
      res.status(201).json(newItem);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/items/:id', checkApiKey, async (req, res) => {
    try {
      const itemID = req.params.id;
      const { itemName, description, type, pastebinLink, authorName } = req.body;
      const item = await liaMongo.get(itemID.toString());

      if (item) {
        const updatedItem = {
          ...item,
          itemName,
          description,
          type,
          pastebinLink,
          authorName
        };
        await liaMongo.put(itemID.toString(), updatedItem);
        res.json(updatedItem);
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/items/:id', checkApiKey, async (req, res) => {
    try {
      const itemID = req.params.id;
      const item = await liaMongo.get(itemID.toString());

      if (item) {
        await liaMongo.remove(itemID.toString());
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to get all JSON data
  app.get('/api/get', checkApiKey, async (req, res) => {
    try {
      const entries = await liaMongo.entries();
      res.json(entries.map(entry => entry.value)); // Returns all items as JSON
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Start server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error("Failed to connect to MongoDB:", err);
});
