import { BigNumber, ethers } from "ethers"
import toast from "react-hot-toast"
import { contract, tokenContract, ERC20, toEth, TOKEN_ICO_CONTRACT } from './constants'
import { useAccount } from "wagmi";

const STAKING_DAPP_ADDRESS = process.env.NEXT_PUBLIC_STAKING_DAPP;
const DEPOSIT_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_DEPOSIT_TOKEN;
const REWARD_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_REWARD_TOKEN;
const TOKEN_LOGO = process.env.NEXT_PUBLIC_TOKEN_LOGO;

const notifySuccess = (msg) => toast.success(msg, {duration: 2000});
const notifyError = (msg) => toast.error(msg, {duration: 2000})

function CONVERT_TIMESTAMP_TO_READABLE(timestamp) {
    const date = new Date(timestamp * 1000);

    const readableTime = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })

    return readableTime;
}

function toWei(amount) {
    const toWei = ethers.utils.parseUnits(amount.toString());
    return toWei.toString();
}

function parseErrorMsg(e) {
    const json = JSON.parse(JSON.stringify(e));
    return json?.reason || json?.error?.message;
}

export const SHORTEN_ADDRESS = (address) => `${address?.slice(0,8)}...${address?.slice(address.length - 4)}`;

export const copyAddress = (text) => {
    navigator.clipboard.writeText(text);
    notifySuccess("Copied successfully")
}

export async function CONTRACT_DATA(address) {
    try {
        const contractObject = await contract();
        const stakingTokenObj = await tokenContract();

        if(address) {
            const contractOwner = await contractObject.owner();
            const contractAddress = await contractObject.address;

            const notifications = await contractObject.getNotifications();

            // Returning an array of objects from any array of structs
            const _notificationsArray = await Promise.all(
                notifications.map(async({poolId, amount, user, typeOf, timestamp}) => {
                    return {
                        poolId: poolId.toNumber(),
                        amount: toEth(amount),
                        user: user,
                        typeOf: typeOf,
                        timestamp: CONVERT_TIMESTAMP_TO_READABLE(timestamp)
                    }
                })
            );

            let poolInfoArray = []
            const poolLength = await contractObject.poolCount();
            const length = poolLength.toNumber()

            for (let i=0; i<length; i++) {
                const poolInfo = await contractObject.poolInfo(i);

                const userInfo = await contractObject.userInfo(i, address)
                const userReward = contractObject.pendingReward(i, address)

                const tokenPoolInfoA = await ERC20(poolInfo.depositToken, address)
                const tokenPoolInfoB = await ERC20(poolInfo.rewardToken, address)

                const pool = {
                    depositTokenAddress: poolInfo.depositToken,
                    rewardTokenAddress: poolInfo.rewardToken,
                    depositToken: tokenPoolInfoA,
                    rewardToken: tokenPoolInfoB,
                    depositedAmount: poolInfo.depositedAmount ? toEth(poolInfo.depositedAmount.toString()) : "0",
                    apy: poolInfo.apy ? poolInfo.apy.toString() : "0",
                    lockDays: poolInfo.lockDays ? poolInfo.lockDays.toString() : "0",
                    amount: userInfo.amount ? toEth(userInfo.amount.toString()) : "0",
                    userReward: userReward ? toEth(userReward) : "0",
                    lockUntil: userInfo.lockUntil ? CONVERT_TIMESTAMP_TO_READABLE(userInfo.lockUntil.toNumber()) : "N/A",
                    lastRewardAt: userInfo.lastRewardAt ? toEth(userInfo.lastRewardAt.toString()) : "0"
                }
                                  
                poolInfoArray.push(pool);
            }

            const totalDepositAmount = poolInfoArray.reduce((total, pool) => {
                return total + parseFloat(pool.depositedAmount)
            }, 0)

            const rewardToken = await ERC20(REWARD_TOKEN_ADDRESS, address);
            const depositToken = await ERC20(DEPOSIT_TOKEN_ADDRESS, address)

            const data = {
                contractOwner,
                contractAddress,
                notifications: _notificationsArray.reverse(),
                rewardToken,
                depositToken,
                poolInfoArray, 
                totalDepositAmount,
                contractTokenBalance: depositToken.contractTokenBalance - totalDepositAmount
            }
            return data;
        }
    } catch (error) {
        console.log("Failed to fetch CONTRACT_DATA", error);
        return parseErrorMsg(error)
    }
}

export async function deposit(poolId, amount, address) {
    try {
       notifySuccess("Calling contract...")
       const contractObj = await contract();
       const stakingTokenObj = await tokenContract()
       
       const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
       const currentAllowance = await stakingTokenObj.allowance(
        address,
        contractObj.address
       )

       if(currentAllowance.lt(amountInWei)) {
        notifySuccess("Approving token...");
        const approveTx = await stakingTokenObj.approve(
            contractObj.address,
            amountInWei
        )
        await approveTx.wait();
        console.log(`Approved ${amountInWei.toString()} tokens for staking`)
       }

       const gasEstimation = await contractObj.estimateGas.deposit(
            Number(poolId),
            amountInWei
       )

       notifySuccess("Staking token call...");
       const stakeTx = await contractObj.deposit(poolId, amountInWei, {
            gasLimit: gasEstimation,
       });

       const receipt = await stakeTx.wait()
       notifySuccess("Tokens staked successfully")
    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}

export async function transferToken(amount, transferAddress) {
    try {
        notifySuccess("Calling contract token...")
        const stakingTokenObj = await tokenContract();
        const transferAmount = ethers.utils.parseEther(amount);

        const approveTx = await stakingTokenObj.transfer(
            transferAddress,
            transferAmount
        )
        await approveTx.wait();
        notifySuccess("Tokens transferred successfully")
        
    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}

export async function withdraw(poolId, amount) {
    try {
        notifySuccess("Calling contract...");

        const amountInWei = ethers.utils.parseUnits(amount.toString(), 18)

        const contractObj = await contract()

        const gasEstimation = await contractObj.estimateGas.withdraw(
            Number(poolId),
            amountInWei
        );

        const data = await contractObj.withdraw(Number(poolId), amountInWei, {
            gasLimit: gasEstimation
        })

        const receipt = await data.wait();
        notifySuccess("Transaction Successfully Completed")
        return receipt;
    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}

export async function claimReward(poolId) {
    try {
        notifySuccess("Calling contract...");
        const contractObj = await contract();

        const gasEstimation = await contractObj.estimateGas.claimReward(
            Number(poolId),
        )

        const data = await contractObj.claimReward(Number(poolId), {
            gasLimit: gasEstimation
        })

        const receipt = await data.wait();
        notifySuccess("Reward claim successfully completed")
        return receipt;

    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}

export async function createPool(pool) {
    try {
        const {_depositToken, _rewardToken, _apy, _lockdays} = pool;
        if(!_depositToken || !_rewardToken || !_apy || !_lockdays) return notifyError("Provide all the details!")

        notifySuccess("Calling contract...");
        const contractObj = await contract();

        const gasEstimation = await contractObj.estimateGas.addPool(
            _depositToken, _rewardToken, Number(_apy), Number(_lockdays)
        )

        const poolTx = await contractObj.addPool(
            _depositToken,
            _rewardToken,
            Number(_apy),
            Number(_lockdays),
            {gasLimit: gasEstimation}
        )

        const receipt = await poolTx.wait();
        notifySuccess("Pool created successfully")
        return receipt;

    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}

export async function modifyPool(poolId, apy) {
    try {
        notifySuccess("Calling contract...");
        const contractObj = await contract();

        const gasEstimation = await contractObj.estimateGas.modifyPool(
         Number(poolId),
         Number(apy)
        )

        const poolTx = await contractObj.modifyPool(
            Number(poolId),
            Number(apy)
        )

        const receipt = await poolTx.wait();
        notifySuccess("Pool modified successfully")
        return receipt;

    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}

export async function swap(tokenData) {
    try {
        const { token, amount } = tokenData;
        if(!token || ! amount) return notifyError("Data is missing")

        notifySuccess("Calling contract...");
        const contractObj = await contract();

        const transferAmount = ethers.utils.parseEther(amount)

        const gasEstimation = await contractObj.estimateGas.swap(
         token,
         transferAmount
        )

        const Tx = await contractObj.swap(
            token,
            transferAmount,
            {gasLimit: gasEstimation}
        )

        const receipt = await Tx.wait();
        notifySuccess("Transaction completed successfully")
        return receipt;

    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}

// ADD TOKEN METAMASK

export const addTokenMetaMask = async(token) => {
    if(window.ethereum){
        const contract = await tokenContract();

        const tokenDecimals = await contract.decimals();
        const tokenAddress = await contract.address();
        const tokenSymbol = await contract.symbol();
        const tokenImage = await TOKEN_LOGO;

        try {
            const wasAdded = await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                        image: tokenImage    
                    }
                }
            })

            if(wasAdded) {
                notifySuccess("Token added");
            } else {
                notifyError ("Failed to add token")
            }
        } catch (error) {
            notifyError ("Failed to add token")
        }
    } else {
        notifyError("Metamask is not installed")
    }
}

// ICO CONTRACT
export const BUY_TOKEN = async (amount) => {
    try {
        notifySuccess("Calling ICO contract")
        const contract = await TOKEN_ICO_CONTRACT();

        const tokenDetails = await contract.getTokenDetails();
        const availableToken = ethers.utils.formatEther(
            tokenDetails.balance.toString()
        )

        if(availableToken > 1) {
            const price = ethers.utils.formatEther(tokenDetails.tokenPrice.toString()) * Number(amount)

            const payAmount = ethers.utils.parseUnits(price.toString(), "ether");

            const transaction = await contract.buyToken(Number(amount), {
                value: payAmount.toString(),
                gasLimit: ethers.utils.hexlify(8000000)
            })
            
            const receipt = await transaction.wait()
            notifySuccess("Transaction sucessfully completed")
            return receipt;
        } else {
            notifyError("Token balance is lower than expected")
        }
        return "receipt"
    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}

export const TOKEN_WITHDRAW = async () => {
    try {
        notifySuccess("Calling ICO contract")
        const contract = await TOKEN_ICO_CONTRACT();

        const tokenDetails = await contract.getTokenDetails();
        const availableToken = ethers.utils.formatEther(
            tokenDetails.balance.toString()
        )

        if(availableToken > 1) {
            const transaction = await contract.withdrawAllTokens();
            
            const receipt = await transaction.wait()
            notifySuccess("Transaction sucessfully completed")
            return receipt;
        } else {
            notifyError("Token balance is lower than expected")
        }

    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}

export const UPDATE_TOKEN = async (_address) => {q
    if(!_address) return notifyError("Data is missing")
    try {
        const contract = await TOKEN_ICO_CONTRACT();

        const gasEstimation = await contract.estimateGas.updateToken(_address)
   

        const transaction = await contract.updateToken(_address, {
            gasLimit: gasEstimation
        })
        
        const receipt = await transaction.wait()
        notifySuccess("Transaction sucessfully completed")
        return receipt;

    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}

export const UPDATE_TOKEN_PRICE = async (price) => {
    try { 
        if(!price) return notifyError("Data is missing")
        const contract = await TOKEN_ICO_CONTRACT();
        const payAmount = ethers.utils.parseUnits(price.toString(), "ether")

        const gasEstimation = await contract.estimateGas.updateTokenSalePrice(payAmount)
   

        const transaction = await contract.updateTokenSalePrice(payAmount, {
            gasLimit: gasEstimation
        })
        
        const receipt = await transaction.wait()
        notifySuccess("Transaction sucessfully completed")
        return receipt;

    } catch (error) {
        console.log(error)
        const errorMsg = parseErrorMsg(error);
        notifyError(errorMsg)
    }
}
