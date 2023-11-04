import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import io from "socket.io-client";

import Products from '../Products/Products';
import InfoInput from './InfoInput/InfoInput';

import Loading from '../Loading/Loading';
import {API} from '../../config';

import './BroadcastInfo.css';

const NodeJS_URL = `${API.NodeJS_URL}/`

const QA_URL = `${API.PythonQA_URL}/`

let socket;

const BroadcastInfo = ({ location }) => {
  const [loading, setLoading] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState('');

  const [broadcastId, setBroadcastId] = useState('');
  const [products, setProducts] = useState([]);

  const [broadcastInfo, setBroadcastInfo] = useState('');
  const [eventInfo, setEventInfo] = useState('');

  useEffect(() => {
    const { broadcastId } = queryString.parse(location.search);
    setBroadcastId(broadcastId);

    socket = io(NodeJS_URL);

    socket.emit('join', { broadcastId }, (error) => {
      if(error) {
        alert(error);
      }
    });

    setLoadingInfo('제품 정보를 불러오는 중 입니다.');
    socket.emit('products', broadcastId);
    setLoading(true);

    socket.on('product', product => {
      product.info = "";
      setProducts(products => [ ...products, product ]);
    });

    socket.on('product-end', () => {
      socket.emit('removeRoom', broadcastId);
      socket.emit('disconnect');
      setLoading(false);
    })

  }, [NodeJS_URL, location.search]);

  const sendBroadcastInfo = (event) => {
    setLoadingInfo('정보를 등록하는 중 입니다.');
    event.preventDefault();
    setLoading(true);

    var detail = {};
    
    detail.broadcast = [
      {"type" : "broadcast", "texts" : broadcastInfo.split("\n")}, 
      {"type" : "event", "texts" : eventInfo.split("\n")}
    ];

    detail.product = [];

    products.forEach(product => {
      detail.product.push({
        "id" : product.id,
        "name" : product.name,
        "texts" : product.info.split("\n")
      });
    })

    const jsonData = JSON.stringify(detail);

    const othePram = {
      headers: {
        'content-type': 'application/json',
      },
      body: jsonData,
      method: 'POST',
    };

    fetch(QA_URL + broadcastId + "/detail", othePram)
      .then(() => {
        window.location.href = `/chat?broadcastId=${broadcastId}`
        setLoading(false);
      })
      .catch((error) => console.log(error));

  }

  return (
    <div>
      {loading ? <Loading info={loadingInfo}/> : 
        <div className="info-outerContainer">
        <div className="info-container">
  
            <form>
  
              <div className="infoContainer justifyStart">
                <div className="infoBox backgroundLight">
                  <p className="infoName colorWhite">방송 정보</p>
                  <InfoInput type={"방송"} setInfo={setBroadcastInfo} info={broadcastInfo} />
                </div>
              </div>

              <div className="infoContainer justifyStart">
                <div className="infoBox backgroundLight">
                  <p className="infoName colorWhite">이벤트 정보</p>
                  <InfoInput type={"이벤트"} setInfo={setEventInfo} info={eventInfo} />
                </div>
              </div>
  
              <Products products={products}/>
  
              <div className="containerBottom">
                <button className={'broadcastInfoButton'} type="submit" onClick={e => sendBroadcastInfo(e)}>상품 정보 저장</button>
              </div>
            </form>
  
          </div>
        </div> 
      }
    </div>
    
  );
}

export default BroadcastInfo;
