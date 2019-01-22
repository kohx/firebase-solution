const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

const firestoreSettings = {
    timestampsInSnapshots: true
}
admin.firestore().settings(firestoreSettings)

const firestore = admin.firestore();

// 集計restaurant
exports.aggregateRatings = functions.firestore
    .document('restaurants/{restaurantId}/ratings/{ratingId}')
    .onCreate((doc, context) => {
        var ratingData = doc.data()

        const restaurantId = context.params.restaurantId
        const restaurantDocRef = firestore.collection('restaurants')
            .doc(restaurantId)

        return firestore.runTransaction(transaction => {
            return transaction.get(restaurantDocRef)
                .then(doc => {

                    if (!doc.exists) {
                        throw "Document does not exist!";
                    }

                    const restaurant = doc.data()
                    const ratingTimes = restaurant.ratingTimes + 1
                    const ratingTotal = restaurant.ratingTotal + ratingData.rate
                    const ratingAvg = ratingTotal / ratingTimes

                    // transaction update
                    transaction.update(restaurantDocRef, {
                        ratingTimes,
                        ratingTotal,
                        ratingAvg,
                    })
                })
        })
    })

exports.addUser = functions.https.onRequest((req, res) => {
    const bob = admin.auth().createUser({
        uid: 'bob',
        displayName: 'bob',
        email: 'bob@bob.com',
        password: '123456',
        emailVerified: false,
        disabled: false
    })
    const david = admin.auth().createUser({
        uid: 'david',
        displayName: 'david',
        email: 'david@david.com',
        password: '123456',
        emailVerified: false,
        disabled: false
    })
    const jane = admin.auth().createUser({
        uid: 'jane',
        displayName: 'jane',
        email: 'jane@jane.com',
        password: '123456',
        emailVerified: false,
        disabled: false
    })

    Promise.all([bob, david, jane])
    .then(user => res.send(user))
    .catch(err => res.send(err))
})