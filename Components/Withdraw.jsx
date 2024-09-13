import React from "react";
import {FaRegCopy} from './ReactICON'

const Withdraw = ({setWithdrawPoolId, poolDetails}) => {
  const poolArray = poolDetails?.poolInfoArray ?? []

  return (  
  <div className="section" id="crypto">
    <div className="container">
      <div className="row">
        <div className="col-12 col-md-8 offset-md-2 col-xl-6 offset-lg-3">
          <div className="section__title">
            <h2>Staking rewards</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus ea quos incidunt quis dolorem saepe libero qui nobis alias odit.</p>
          </div>
        </div>
      </div>

      <div className="row" style={{padding: "5%"}}>
        {
          poolArray.map((pool, index) => (
            <div key={index} className={`col-12 col-md-6 col-lg-4`}>
              <div className="node">
                <h3 className={`node__title ${index === 0 ? "orange" : index === 1 ? "green": index === 2 ? "blue" : "orange"}`}>
                  <b>{pool.amount}</b> {pool?.rewardToken.symbol}
                </h3>

                <span className="node__date">
                  {pool?.lockdays} days
                </span>
                <span className="node__price">
                  {" "}
                  <b>Reward:</b> {pool?.userReward} {pool?.rewardToken.symbol}
                </span>
                <span className="node__line">
                  <img src="img/dodgers/dots--line-orange.svg" alt="" />
                </span>

                <ul className="node__list">
                  <li>
                    <b>{pool?.depositToken.symbol} &nbsp; </b>{pool?.depositToken.address.slice(0,15)}... <FaRegCopy />
                  </li>
                  <li>
                    <b>{pool?.rewardToken.symbol} &nbsp; </b>{pool?.rewardToken.address.slice(0,15)}... <FaRegCopy />
                  </li>
                  <li>
                    <b>Current APY: &nbsp; &nbsp;</b>
                    {pool?.apy}% <FaRegCopy />
                  </li>
                  <li>
                    <b>LR: &nbsp;</b>
                    {pool?.lastRewardAt}
                  </li>


                </ul>

                <button className="node__btn" data-bs-target="#modal-node" type="button" data-bs-toggle="modal" onClick={() => setWithdrawPoolId(index == 0 ? 0 : index == 1 ? 1 : index == 2 ? 2 : "")}>
                  Withdraw /  Claim
                </button>

                <span className="screw screw--line-tr" />
              </div>
            </div>
          )).slice(0,3)
        }
      </div>

    </div>
  </div>
)};

export default Withdraw;
