const axios = require('axios');

const SEPAY_API_URL = 'https://my.sepay.vn/userapi/transactions/list';
// Thử các endpoint phổ biến, bạn chỉ cần đổi lại nếu doc cung cấp endpoint khác
const SEPAY_LOGIN_URLS = [
  'https://my.sepay.vn/api/login',
  'https://my.sepay.vn/userapi/login',
  'https://my.sepay.vn/api/auth/login',
  'https://my.sepay.vn/userapi/auth/login'
];

exports.sepayLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Thiếu username hoặc password' });
    }

    const loginBody = { username, password };

    let lastError = null;
    for (const url of SEPAY_LOGIN_URLS) {
      try {
        const response = await axios.post(url, loginBody, {
          headers: { 'Content-Type': 'application/json' }
        });
        // Nếu trả về JSON có token, trả về luôn
        if (response.data && (response.data.token || response.data.access_token)) {
          return res.json({ token: response.data.token || response.data.access_token });
        }
        // Nếu trả về JSON nhưng không có token, thử endpoint tiếp theo
        if (typeof response.data === 'object') {
          lastError = { error: 'Không tìm thấy token trong response', detail: response.data };
          continue;
        }
        // Nếu trả về HTML, báo lỗi rõ ràng
        if (typeof response.data === 'string' && response.data.includes('<html')) {
          lastError = { error: 'Endpoint này trả về HTML, không phải API login', url };
          continue;
        }
      } catch (err) {
        lastError = { error: 'Lỗi khi gọi endpoint', url, detail: err?.response?.data || err.message };
        continue;
      }
    }
    // Nếu thử hết mà không thành công
    return res.status(400).json(lastError || { error: 'Không tìm thấy endpoint API login phù hợp' });
  } catch (error) {
    res.status(500).json({
      error: 'Lỗi đăng nhập SePay',
      detail: error?.response?.data || error.message
    });
  }
};

// Lấy giao dịch SePay bằng token (truyền từ frontend)
exports.getSepayTransactions = async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '') || req.query.token;
    if (!token) {
      return res.status(401).json({ error: 'Thiếu API Token SePay, vui lòng nhập token.' });
    }
    // Lấy params filter/search/pagination từ query
    const {
      date_from,
      date_to,
      status,
      bankName,
      search,
      page = 1,
      pageSize = 10
    } = req.query;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    // Chuẩn bị params gửi lên SePay nếu API hỗ trợ
    const params = {};
    if (date_from) params.date_from = date_from;
    if (date_to) params.date_to = date_to;
    if (status) params.status = status;
    if (bankName) params.bankName = bankName;
    if (search) params.search = search;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    // Gọi SePay API, ưu tiên truyền params nếu API hỗ trợ
    let response;
    try {
      response = await axios.get(SEPAY_API_URL, { headers, params });
    } catch (err) {
      // Nếu API không hỗ trợ params, fallback gọi không params
      response = await axios.get(SEPAY_API_URL, { headers });
    }
    let transactions = response.data && response.data.transactions ? response.data.transactions : [];

    // Nếu API không hỗ trợ filter, filter thủ công ở backend
    if (date_from) {
      transactions = transactions.filter(t => new Date(t.transaction_date) >= new Date(date_from));
    }
    if (date_to) {
      transactions = transactions.filter(t => new Date(t.transaction_date) <= new Date(date_to + 'T23:59:59'));
    }
    if (status) {
      transactions = transactions.filter(t => (t.status || '').toLowerCase() === status.toLowerCase());
    }
    if (bankName) {
      transactions = transactions.filter(t => (t.bank_brand_name || '').toLowerCase().includes(bankName.toLowerCase()));
    }
    if (search) {
      const s = search.trim().toLowerCase();
      transactions = transactions.filter(t =>
        (t.transaction_content || '').toLowerCase().includes(s) ||
        (t.reference_number || '').toLowerCase().includes(s) ||
        (t.account_number || '').toLowerCase().includes(s)
      );
    }
    // Phân trang thủ công nếu API không hỗ trợ
    const total = transactions.length;
    const pageInt = parseInt(page) || 1;
    const pageSizeInt = parseInt(pageSize) || 10;
    const start = (pageInt - 1) * pageSizeInt;
    const end = start + pageSizeInt;
    const pagedData = transactions.slice(start, end);

    res.json({ data: pagedData, total });
  } catch (error) {
    res.status(error?.response?.status || 500).json({
      error: 'Lỗi khi lấy giao dịch SePay',
      detail: error?.response?.data || error.message
    });
  }
}; 