import { type ReactElement } from 'react';
import NumberButtonBox from '../components/NumberButtonBox';
import OrderWaitPeople from '../components/OrderWaitPeople';
import { processOrderCollection } from '../utils/processOrderCollection';
import { useOrderCollection } from '@/firebase/useOrderCollection';
import { useMoney } from '@/firebase/useMoney';

// const orders = [
//   1, 2, 3, 4, 4, 5, 4, 231, 3245, 324, 332, 344, 223, 421, 324, 321, 123, 242, 234, 231, 324, 23, 4, 234, 443, 244,
//   232,
// ];

export default function Order(): ReactElement {
  const process = 'accounting';
  const orderData = processOrderCollection(process);
  console.log('🚀 ~ Order ~ order:', orderData);

  const ordersId = orderData.map((order) => Number(order.id));
  // const orders = [Number(order)];

  return (
    <div>
      <NumberButtonBox ordersId={ordersId} />
      <OrderWaitPeople ordersId={ordersId} />
    </div>
  );
}
