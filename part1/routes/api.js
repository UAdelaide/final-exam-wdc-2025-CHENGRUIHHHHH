const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 查询所有狗狗及其主人用户名
router.get('/dogs', async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT d.name AS dog_name, d.size, u.username AS owner_username
        FROM Dogs d
        JOIN Users u ON d.owner_id = u.user_id
      `);
      res.json(rows); // 成功时返回结果
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch dogs' }); // 发生错误
    }
});

// 获取所有状态为 open 的遛狗请求
router.get('/walkrequests/open', async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT wr.request_id, d.name AS dog_name, wr.requested_time, 
               wr.duration_minutes, wr.location, u.username AS owner_username
        FROM WalkRequests wr
        JOIN Dogs d ON wr.dog_id = d.dog_id
        JOIN Users u ON d.owner_id = u.user_id
        WHERE wr.status = 'open'
      `);
      res.json(rows); // 将查询结果以 JSON 返回
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch open walk requests' });
    }
});

// 汇总每个遛狗师的评分和完成的遛狗次数
router.get('/walkers/summary', async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT u.username AS walker_username,
               COUNT(r.rating_id) AS total_ratings,
               AVG(r.rating) AS average_rating,
               COUNT(DISTINCT r.request_id) AS completed_walks
        FROM Users u
        LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
        WHERE u.role = 'walker'
        GROUP BY u.user_id, u.username
      `);
      res.json(rows); // 直接返回计算后的汇总信息
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch walker summary' });
    }
});


module.exports = router; 