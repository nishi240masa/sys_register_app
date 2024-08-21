import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { atom } from 'jotai';
import { db } from './firebase';
import { items, options, order, orderCollection, UpdateOrder, options_id } from '../types/index';
import { loadable } from 'jotai/utils';
import { ref } from 'firebase/storage';

// firebaseのエラーを判定する関数
// 型ガードを使用する
function isFirebaseError(err: unknown): err is { code: string; message: string } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

export type optionRef = string;

// データを取得する関数

// 会計前の注文データを取得する関数
export const fetchReservationOrder = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'order'));
    
        const OrderData: order[] = querySnapshot.docs.map((doc): order => {
        const data = doc.data();
        return {
            id: doc.id,
            item: data.item,
            options: data.options,
            qty: data.qty,
        };
        });
    
        return OrderData;
    } catch (err) {
        if (isFirebaseError(err)) {
        console.error('Firestore Error:', err);
        } else {
        console.error('一般的なエラー', err);
        }
    } finally {
        console.log('finally');
    }
};

// orderCollectionのデータを取得する関数
export const fetchOrderCollection = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'orderCollection'));

        const orderCollectionData: orderCollection[] = await Promise.all(
            querySnapshot.docs.map(async (doc): Promise<orderCollection> => {
                const data = doc.data();


                // orderのデータを取得
                const order = async () => {


                const orderRef = await getDocs(collection(db, 'orderCollection', doc.id, 'order'));

                const orderData:order[] =  await Promise.all(
                orderRef.docs.map(async(doc): Promise<order> => {
                const data = doc.data();

                const itemRef = data.item;

                const itemDoc =  await itemRef.get();

                const itemData = itemDoc.data();

                const optionData:options[] = await Promise.all(data.options.map(async (optionRef:any)=> {
                    const optionDoc = await optionRef.get();
                    return optionDoc.data();
                }
                ));


                return {
                    id: doc.id,
                    item: itemData,
                    options: optionData,
                    qty: data.qty,
                };
            }));

            return orderData;

                }

                const orderData = await order();



                return {
                    id: doc.id,
                    order: orderData,
                    timestamp: data.timestamp,
                    accounting: data.accounting,
                    cooking: data.cooking,
                    offer: data.offer,
                };
            })
        );

        return orderCollectionData;
    } catch (err) {
        if (isFirebaseError(err)) {
            console.error('Firestore Error:', err);
        } else {
            console.error('一般的なエラー', err);
        }
    } finally {
        console.log('finally');
    }
};

export const orderCollectionAtom = loadable(atom(async () => await fetchOrderCollection()));

// itemsのデータを取得する関数
export const fetchItems = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'item'));
    
        const ItemsData: items[] = querySnapshot.docs.map((doc): items => {
        const data = doc.data();
        return {
            id: doc.id,
            user_id: data.user_id,
            name: data.name,
            price: data.price,
            visible: data.visible,
            category_id: data.category_id,
            options_id: data.opthons_id,
        };
        });
    
        return ItemsData;
    } catch (err) {
        if (isFirebaseError(err)) {
        console.error('Firestore Error:', err);
        } else {
        console.error('一般的なエラー', err);
        }
    } finally {
        console.log('finally');
    }
};

export const itemsAtom = loadable(atom(async () => await fetchItems()));

// optionsのデータを取得する関数
export const option = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'opthons'));
    
        const OptionsData: options[] = querySnapshot.docs.map((doc): options => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            price: data.price,
        };
        });
    
        return OptionsData;
    } catch (err) {
        if (isFirebaseError(err)) {
        console.error('Firestore Error:', err);
        } else {
        console.error('一般的なエラー', err);
        }
    } finally {
        console.log('finally');
    }
};

export const optionsAtom = loadable(atom(async () => await option()));


// orderのデータを更新する関数

export const updateOrder = async (id: string, data: UpdateOrder) => {
    try {

      await updateDoc(doc(db, 'order', id), {'items_id': data.items_id});  

      console.log('注文の変更が完了しました');

    } catch (err) {
        if (isFirebaseError(err)) {
        console.error('Firestore Error:', err);
        } else {
        console.error('一般的なエラー', err);
        }
    } finally {
        console.log('finally');
    }
}

// orderのデータを消去する関数

export const deleteOrder = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'order', id));
        console.log('注文の削除が完了しました');
    } catch (err) {
        if (isFirebaseError(err)) {
        console.error('Firestore Error:', err);
        } else {
        console.error('一般的なエラー', err);
        }
    } finally {
        console.log('finally');
    }
}
