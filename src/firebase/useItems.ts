import { userAtom } from '@/login/AdminLogin';
import { developer, type items, type itemsData, type options } from '@/types';
import {
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  type DocumentReference,
  getDoc,
  onSnapshot,
  type PartialWithFieldValue,
  type QueryDocumentSnapshot,
  setDoc,
} from 'firebase/firestore';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { User } from 'firebase/auth';

function converter<T>() {
  return {
    toFirestore: (data: PartialWithFieldValue<T>) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
  };
}

// dataの更新
export const updateItems = async (newData: items, user: User | developer) => {
  const data = {
    name: newData.name,
    category_id: newData.category_id,
    price: newData.price,
    visible: newData.visible,
    imgUrl: newData.imgUrl,
  };

  const colRef = collection(db, 'shop_user', user.uid, 'items').withConverter(converter<items>());

  await setDoc(doc(colRef, newData.id), data);

  console.log('updateItems');
};

// 新規作成または追加
export const setItems = async (data: itemsData, user: User | developer) => {
  const colRef = collection(db, 'shop_user', user.uid, 'items').withConverter(converter<items>());

  await setDoc(doc(colRef), data);

  console.log('setItems');
};

export const getItems = (user: User | developer) => {
  const [data, setData] = useState<items[]>();
  const colRef = collection(db, 'shop_user', user.uid, 'item').withConverter(converter<items>());

  useEffect(() => {
    const unsub = onSnapshot(colRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const docSnapshot = change.doc;
        const Docdata = docSnapshot.data();

        const itemData = docSnapshot.data() as DocumentData;
        const optionsArray = itemData.options ?? [];
        const optionData: options[] = await Promise.all(
          optionsArray.map(async (optionRef: DocumentReference) => {
            const optionSnap = await getDoc(optionRef);
            const optionData = optionSnap.data();
            if (optionSnap.exists()) {
              return {
                id: optionSnap.id,
                name: optionData?.name as string,
                price: optionData?.price as number,
              };
            }
            return { id: null, name: null, price: null };
          }),
        );

        const newData: items = {
          id: docSnapshot.id,
          name: Docdata.name as string,
          price: Docdata.price as number,
          category_id: Docdata.category_id as string,
          visible: Docdata.visible as boolean,
          options: optionData,
          imgUrl: Docdata.imgUrl as string,
        };

        // 追加時
        if (change.type === 'added') {
          setData((prevData) => [...(prevData || []), newData]);
        }

        // 修正（更新時）
        if (change.type === 'modified') {
          setData((prevData) => {
            if (prevData) {
              return prevData.map((data) => {
                if (data.id === docSnapshot.id) {
                  return newData;
                }
                return data;
              });
            }
            return prevData;
          });
        }
        // 完全削除時
        if (change.type === 'removed') {
          setData((prevData) => {
            if (prevData) {
              return prevData.filter((data) => data.id !== docSnapshot.id);
            }
            return prevData;
          });
        }
      });
    });

    console.log('Changed!!!');
    // const newData = snapshot.docs.map((doc) => doc.data() as orderCollection);
    // setData(newData);
    return () => {
      unsub();
    };
  }, []);
  return data;
};

// itemを消去する関数
export const deleteItems = async (itemId: string, user: User | developer) => {
  await deleteDoc(doc(db, 'shop_user', user.uid, 'items', itemId));

  console.log('deleteItems');
};
