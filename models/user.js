const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    // 1. 장바구니에서 현재 추가하려는 제품의 인덱스를 찾습니다.
    const cartProductIndex = this.cart.items.findIndex(cp => {
      // cp는 장바구니 아이템을 나타냄
      // product._id와 cp.productId가 같은지 비교
      //아니라면 findIndex 의 기본원리에 의해서 인덱스에 없는 물건이라면 -1 반환
      return cp.productId.toString() === product._id.toString();
  });

  // 2. 새로운 수량을 1로 초기화합니다.
  let newQuantity = 1;
  
  // 3. 현재 장바구니의 아이템을 복사하여 업데이트할 아이템 리스트를 만듭니다.
  const updatedCartItems = [...this.cart.items];

  // 4. 장바구니에 이미 해당 제품이 존재하는 경우(물건 이미 있으니 기존 물건의 수량 증가)
  if (cartProductIndex >= 0) {
      // 현재 제품의 수량을 가져와 1을 더합니다.
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;

      // 업데이트된 수량으로 해당 인덱스의 아이템을 수정합니다.
      updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
      // 5. 장바구니에 해당 제품이 없는 경우, 새로운 제품을 추가합니다.
      updatedCartItems.push({
          // 새로운 제품 객체를 생성
          productId: new ObjectId(product._id), // 제품 ID
          quantity: newQuantity // 초기 수량 1
      });
  }

  // 6. 업데이트된 아이템 리스트를 가진 새로운 장바구니 객체를 생성합니다.
  const updatedCart = {
      items: updatedCartItems // 업데이트된 아이템 배열
  };

  // 7. 데이터베이스에 연결합니다.
  const db = getDb();
  
  // 8. 사용자의 장바구니를 업데이트합니다.
  return db
      .collection('users') // 'users' 컬렉션 선택
      .updateOne(
          { _id: new ObjectId(this._id) }, // 현재 사용자의 ID로 찾기
          { $set: { cart: updatedCart } } // 장바구니를 업데이트된 것으로 설정
      );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(i => {
      return i.productId;
    });
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            quantity: this.cart.items.find(i => {
              return i.productId.toString() === p._id.toString();
            }).quantity
          };
        });
      });
  }


  //삭제 함수(단순 딜리트가 아니라 배열에서 각각의 요소 비교후 ) ==> productId가 삭제할 productId와 일치하지 않는 경우에만
  //그 아이템을 새로운 배열에 포함시켜서 새로운 배열 생성
  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name
          }
        };
        return db.collection('orders').insertOne(order);
      })
      .then(result => {
        this.cart = { items: [] };
        return db
          .collection('users')
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  getOrders() {
    const db = getDb();
    return db
      .collection('orders')
      .find({ 'user._id': new ObjectId(this._id) })
      .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) })
      .then(user => {
        if (!user.cart) {
          user.cart = { items: [] };
        }
        return user;
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = User;
