/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable max-len */
/* eslint-disable radix */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import ABI from './ABI.json';

const weiToEth = 1 / 1000000000000000000;
const CONTRACT_ADDRESS = '0x697915d4c1386Cf91fCb9d174a0B07A23A450633';
const EMPTY_HEX = '0x0000000000000000000000000000000000000000';

let web3 = null;
let contract = null;

function App() {
  const [address, setAddress] = useState('');
  const [form, setForm] = useState({
    registration: '',
    owner: '',
    offer: {
      amount: '3',
      toWallet: '0x92DA7b05c3E60d95Ab499F725DB12293a00b4b5A',
      registration: 'AAA1234',
    },
    hasError: '',
    response: '',
    cancelOffer: '',
    lockedBalance: '',
    contractBalance: '',
  });

  const loadContract = async () => {
    if (!contract) {
      contract = new web3.eth.Contract(ABI.abi, CONTRACT_ADDRESS);
    }
  };

  const onAddressLoaded = (accountAddress) => {
    setAddress(accountAddress);

    contract.methods.getMyBalance().call({ from: accountAddress }).then((lockedBalance) => {
      setForm({
        ...form,
        lockedBalance,
      });
    }).catch((error) => console.log(error));

    contract.methods.getContractBalance().call({ from: accountAddress }).then((contractBalance) => {
      setForm({
        ...form,
        contractBalance,
      });
    }).catch((error) => console.log(error));
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      web3 = new Web3(window.ethereum);

      web3.eth.getAccounts().then((accounts) => {
        onAddressLoaded(accounts[0]);
      }).catch((error) => console.log(error));

      loadContract();

      window.ethereum.on('accountsChanged', (accounts) => {
        onAddressLoaded(accounts[0]);
      });
    }
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col">
              &nbsp;
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h2>Ethereum Dapp</h2>
        </div>
      </div>
      <div className="row">
        <div className="col">
          Iteracting with contract
          {' '}
          <b>{CONTRACT_ADDRESS}</b>
          {' '}
          using your account
          {' '}
          <b>{address}</b>
        </div>
      </div>

      <hr />
      <div className="row">
        <div className="col-3 col-sm-12">
          <h4>Store a new registration</h4>
          <input
            type="text"
            className={`form-control ${form.hasError ? 'is-invalid' : ''}`}
            placeholder="Fill in the vehicle registration"
            value={form.registration}
            onChange={(e) => setForm({
              ...form,
              registration: e.target.value.toUpperCase(),
            })}
          />
        </div>
      </div>
      <br />
      <div className="row">
        <div className="col">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              contract.methods.saveRegistration(form.registration).send({ from: address }, (error, result) => {
                if (result) {
                  setForm({
                    ...form,
                    hasError: true,
                  });
                }

                if (!error) {
                  setForm({
                    ...form,
                    registration: '',
                  });
                }
              });
            }}
          >
            Save
          </button>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-3 col-sm-12">
          <h4>
            Who is the owner?
            {' '}
            {form.response}
          </h4>
          <input
            type="text"
            className="form-control"
            placeholder="Fill in the vehicle registration"
            value={form.owner}
            onChange={(e) => setForm({
              ...form,
              owner: e.target.value.toUpperCase(),
            })}
          />
        </div>
      </div>

      <br />

      <div className="row">
        <div className="col">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              contract.methods.getOwner(form.owner).call((error, result) => {
                setForm({
                  ...form,
                  registration: '',
                  hasError: false,
                });

                if (!error && result !== EMPTY_HEX) {
                  setForm({
                    ...form,
                    response: result,
                  });
                }
              });
            }}
          >
            Search
          </button>
        </div>
      </div>

      <hr />

      <h4>Make an offer</h4>

      <div className="row">
        <div className="col-6">
          <label htmlFor="exampleFormControlInput1" className="form-label">To wallet</label>
          <input
            type="text"
            className="form-control"
            placeholder="fill in ether amount"
            value={form.offer.toWallet}
            onChange={(e) => setForm({
              ...form,
              offer: {
                ...form.offer,
                toWallet: e.target.value,
              },
            })}
          />
        </div>
        <div className="col">
          <label htmlFor="exampleFormControlInput1" className="form-label">ETH</label>
          <input
            type="text"
            className="form-control"
            placeholder="fill in ether amount"
            value={form.offer.amount}
            onChange={(e) => setForm({
              ...form,
              offer: {
                ...form.offer,
                amount: e.target.value,
              },
            })}
          />
        </div>
        <div className="col-3 col-sm-12">
          <label htmlFor="exampleFormControlInput1" className="form-label">Registration</label>
          <input
            type="text"
            className="form-control"
            placeholder="fill in ether amount"
            value={form.offer.registration}
            onChange={(e) => setForm({
              ...form,
              offer: {
                ...form.offer,
                registration: e.target.value.toUpperCase(),
              },
            })}
          />
        </div>
      </div>

      <br />

      <div className="row">
        <div className="col-3 col-sm-12">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => contract.methods.createOffer(form.offer.toWallet, form.offer.registration).send({ from: address, value: parseInt(form.offer.amount) / weiToEth })}
          >
            Save
          </button>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-3 col-sm-12">
          <h4>Cancel an offer</h4>
          <label htmlFor="exampleFormControlInput1" className="form-label">Registration</label>
          <input
            type="text"
            className="form-control"
            placeholder="Fill in the vehicle registration"
            value={form.cancelOffer}
            onChange={(e) => setForm({
              ...form,
              cancelOffer: e.target.value.toUpperCase(),
            })}
          />
        </div>
      </div>

      <br />

      <div className="row">
        <div className="col">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => contract.methods.cancelOffer(form.cancelOffer).send({ from: address })}
          >
            Cancel
          </button>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-3 col-sm-12">
          <h4>My locked balance: </h4>
          {' '}
          {form.lockedBalance * weiToEth}
          {' '}
          ETH
        </div>
      </div>

      <br />

      <div className="row">
        <div className="col">
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              const lockedBalance = await contract.methods.getMyBalance().call({ from: address });
              setForm({
                ...form,
                lockedBalance,
              });
            }}
          >
            Balance
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-3 col-sm-12">
          <h4>Contract balance: </h4>
          {' '}
          {form.contractBalance * weiToEth}
          {' '}
          ETH
        </div>
      </div>

      <br />

      <div className="row">
        <div className="col">
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              const contractBalance = await contract.methods.getContractBalance().call({ from: address });
              setForm({
                ...form,
                contractBalance,
              });
            }}
          >
            Balance
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
