// SPDX-License-Identifier: MIT
import './library.sol';

pragma solidity ^0.8.0;

contract StakingDapp is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct UserInfo{
        uint256 amount;
        uint lastRewardAt;
        uint256 lockUntil;
    }

    struct PoolInfo{
        IERC20 depositToken;
        IERC20 rewardToken;
        uint256 depositedAmount;
        uint256 apy;
        uint lockDays;
    }

    struct Notification{
        uint256 poolId;
        uint256 amount;
        address user;
        string typeOf;
        uint256 timestamp;
    }

    uint decimals = 10 ** 18;
    uint public poolCount;
    PoolInfo[] public poolInfo;

    mapping(address => uint256) public depositedTokens;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    Notification[] public notifications;

    // CONTRACT FUNCTIONS

    function addPool(IERC20 _depositToken, IERC20 _rewardToken, uint256 _apy, uint _lockdays) public onlyOwner {
        poolInfo.push(PoolInfo({
            depositToken: _depositToken,
            rewardToken: _rewardToken,
            depositedAmount: 0,
            apy: _apy,
            lockDays: _lockdays
        }));

        poolCount++;
    }

    function deposit(uint _pid, uint _amount) public nonReentrant {
        require(_amount > 0, "Amount should be greater than 0!");

        PoolInfo storage pool = poolInfo[_pid];
        // potential error
        UserInfo storage user = userInfo[_pid][msg.sender];

        if(user.amount > 0) {
            uint pending = _calcPendingReward(user, _pid);
            pool.rewardToken.transfer(msg.sender, pending);

            _createNotification(_pid, pending, msg.sender, "Claim");
        }

        pool.depositToken.transferFrom(msg.sender, address(this), _amount);

        pool.depositedAmount += _amount;

        user.amount += _amount;
        user.lastRewardAt = block.timestamp;

        // user.lockUntil = block.timestamp + (pool.lockDays * 86400); // number of seconds per day
        user.lockUntil = block.timestamp + (pool.lockDays * 60); // minutes instead of days

        depositedTokens[address(pool.depositToken)] += _amount;

        _createNotification(_pid, _amount, msg.sender, "Deposit");
    }

    function withdraw(uint _pid, uint _amount) public nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        require(user.amount >= _amount, "Withdraw amount cannot exceed the balance");
        require(user.lockUntil <= block.timestamp, "Lock is Active!");

        uint256 pending = _calcPendingReward(user, _pid);

        if(user.amount > 0) {
            pool.rewardToken.transfer(msg.sender, pending);

            _createNotification(_pid, pending, msg.sender, "Claim");
        }

        if(_amount > 0) {
            user.amount -= _amount;
            pool.depositedAmount -= _amount;
            depositedTokens[address(pool.depositToken)] -= _amount;

            pool.depositToken.transfer(msg.sender, _amount);
        }

        user.lastRewardAt = block.timestamp;

        _createNotification(_pid, _amount, msg.sender, "Withdraw");

    }

    function _calcPendingReward(UserInfo storage user, uint _pid) internal view returns(uint) {
        PoolInfo storage pool = poolInfo[_pid];

        // uint daysPassed = (block.timestamp - user.lastRewardAt) / 86400;
        uint daysPassed = (block.timestamp - user.lastRewardAt) / 60;

        if(daysPassed > pool.lockDays) {
            daysPassed = pool.lockDays;
        }

        return user.amount * daysPassed / 365 / 100 * pool.apy;
    }

    function pendingReward(uint _pid, address _user) public view returns(uint) {
        UserInfo storage user = userInfo[_pid][_user];

        return _calcPendingReward(user, _pid);
    }

    function swap(address token, uint256 _amount) external onlyOwner {
        uint256 token_balance = IERC20(token).balanceOf(address(this));
        require(_amount <= token_balance, "Amount exceeds balance");
        require(token_balance - _amount >= depositedTokens[token], "Can't withdraw deposited tokens");

        IERC20(token).safeTransfer(msg.sender, _amount);
    }

    function modifyPool(uint _pid, uint _apy) public onlyOwner{
        PoolInfo storage pool = poolInfo[_pid];
        pool.apy = _apy;
    }

    function claimReward(uint _pid) public nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        require(user.lockUntil <= block.timestamp, "Lock is active");

        uint256 pending = _calcPendingReward(user, _pid);
        require(pending > 0, "No rewards to claim");

        user.lastRewardAt = block.timestamp;

        pool.rewardToken.transfer(msg.sender, pending);
        _createNotification(_pid, pending, msg.sender, "Claim");

    }

    function _createNotification(uint _id, uint _amount, address _user, string memory _typeOf) internal {
        notifications.push(Notification({
            poolId: _id,
            amount: _amount,
            user: _user,
            typeOf: _typeOf,
            timestamp: block.timestamp
        }));
    }

    function getNotifications() public view returns(Notification[] memory) {
        return notifications;
    }
}