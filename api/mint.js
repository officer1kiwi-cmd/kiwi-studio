const { ethers } = require('ethers');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { userAddress, imageUri, amountInK } = req.body;

        // เชื่อมต่อบล็อกเชน (ใช้ RPC ของ Polygon)
        const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");

        // ใช้ Private Key ที่เราจะไปตั้งค่าใน Vercel Settings
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        // เชื่อมต่อกับสัญญา NFT ที่พี่เพิ่ง Deploy
        const nftAbi = ["function mintForUser(address user, string memory uri, uint256 amountInK) public"];
        const nftContract = new ethers.Contract(process.env.NFT_CONTRACT_ADDRESS, nftAbi, wallet);

        // สั่ง Mint ทันที (Gas จะถูกตัดจากกระเป๋าเจ้าของ Private Key)
        const tx = await nftContract.mintForUser(userAddress, imageUri, amountInK);
        const receipt = await tx.wait();

        return res.status(200).json({ success: true, txHash: receipt.transactionHash });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
