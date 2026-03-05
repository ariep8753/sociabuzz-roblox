const donations = [];
const processedIds = new Set();

export default function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // POST - Terima donasi dari SociaBuzz webhook
    if (req.method === 'POST') {
        try {
            const body = req.body;

            // Cek duplikat
            const donationId = body.invoice_id || body.id || Date.now().toString();
            if (processedIds.has(donationId)) {
                return res.status(200).json({ success: true, message: 'Already processed' });
            }

            processedIds.add(donationId);

            // Simpan donasi
            const donation = {
                id: donationId,
                nama: body.donatur_name || body.nama || "Anonymous",
                amount: parseInt(body.amount_raw || body.amount || 0),
                message: body.donatur_note || body.message || "",
                email: body.donatur_email || "",
                timestamp: new Date().toISOString()
            };

            donations.unshift(donation); // Tambah ke depan

            // Maksimal simpan 50 donasi
            if (donations.length > 50) {
                donations.pop();
            }

            console.log('New donation:', donation);
            return res.status(200).json({ success: true, donation });

        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    // GET - Roblox ambil donasi baru
    if (req.method === 'GET') {
        const path = req.url;

        if (path.includes('get-donations')) {
            // Ambil semua donasi lalu kosongkan
            const toSend = [...donations];
            donations.length = 0;

            return res.status(200).json({
                success: true,
                donations: toSend,
                count: toSend.length
            });
        }

        if (path.includes('health')) {
            return res.status(200).json({
                success: true,
                status: 'online',
                time: new Date().toISOString()
            });
        }
    }

    return res.status(404).json({ success: false, message: 'Not found' });
}
