import {databaseManager} from './db.js'

const totalPrice = document.getElementById("total-price")
const totalService = document.getElementById("service-price")
const coupon = document.getElementById("off")
const toPay = document.getElementById("total-to-pay")
const couponText = document.getElementById("coupon-text")
const couponButton = document.getElementById("coupon-button")
const finishButton = document.getElementById("finish")
const backgroundElement = document.getElementById("background")
const modalElement = document.getElementById("modal")
const okButtonElement = document.getElementById("ok")

const menu = document.getElementById('menu')

const stateManager = {
    state: {
        coupon: {
            code: "",
            validated: false,
            percentage: 0
        }
    },
    setState(state) {
        this.state = state

    },

}

const domManager = {
    refresh() {
        this.deleteFoods()
        this.generateFoods()
        this.generateTotalInfo()
    },
    deleteFoods() {
        menu.innerHTML = ""
    },
    generateFoods() {
        foodManager.foods.forEach(food => {

            const itemElement = document.createElement('div')
            itemElement.classList.add("item")
            itemElement.id = food.id
            const imageContainer = document.createElement('div')
            imageContainer.classList.add('item-image-container')
            const image = document.createElement('img')
            image.classList.add('img-item')
            image.src = `asset/image/${food.picture}`
            imageContainer.appendChild(image)
            itemElement.appendChild(imageContainer)


            const itemInfoElement = document.createElement('div')
            itemInfoElement.classList.add("item-information")

            const itemTitleElement = document.createElement('div')
            itemTitleElement.classList.add("item-title")
            itemTitleElement.innerHTML = food.name
            itemInfoElement.appendChild(itemTitleElement)

            const itemPriceElement = document.createElement('div')
            itemPriceElement.classList.add('item-price')
            itemPriceElement.innerHTML = `${food.price} تومان`
            itemInfoElement.appendChild(itemPriceElement)


            const itemOperatorContainer = document.createElement('div')
            itemOperatorContainer.classList.add("item-operation-container")

            const itemOperators = document.createElement('div')
            itemOperators.classList.add("flex")

            const itemIncrease = document.createElement('div')
            itemIncrease.classList.add('item-increase-button')
            itemIncrease.addEventListener('click', eventManager.add)

            const itemNumberInput = document.createElement('div')
            itemNumberInput.classList.add("item-number-input")
            itemNumberInput.innerHTML = food.quantity

            const itemDecrease = document.createElement('div')
            itemDecrease.classList.add('item-decrease-button')
            itemDecrease.addEventListener('click', eventManager.subtract)

            itemOperators.appendChild(itemIncrease)
            itemOperators.appendChild(itemNumberInput)
            itemOperators.appendChild(itemDecrease)

            itemOperatorContainer.appendChild(itemOperators)

            const itemTotalPrice = document.createElement('div')
            itemTotalPrice.innerHTML = food.quantity * food.price + " تومان"

            itemOperatorContainer.appendChild(itemTotalPrice)

            itemInfoElement.appendChild(itemOperatorContainer)
            itemElement.appendChild(itemInfoElement)
            // itemElement.appendChild(itemOperatorContainer)
            menu.appendChild(itemElement)
        })
    },
    generateTotalInfo() {
        const totalPriceInt = foodManager.totalPrice()
        const totalServiceInt = totalPriceInt * 0.05
        totalPrice.innerHTML = totalPriceInt + " تومان"
        totalService.innerHTML = totalServiceInt + " تومان"
        if (stateManager.state.coupon.validated) {
            coupon.innerHTML = (totalPriceInt + totalServiceInt) * (stateManager.state.coupon.percentage) / 100 + " تومان"
            toPay.innerHTML = (totalPriceInt + totalServiceInt) * (100 - stateManager.state.coupon.percentage) / 100 + " تومان"
        } else {
            toPay.innerHTML = (totalPriceInt + totalServiceInt) + " تومان"
        }


    }
}

const couponManager = {
    getCoupon: coupon => databaseManager.coupons.find(couponObject => couponObject.code === coupon),
    validate: coupon => !!databaseManager.coupons.find(couponObject => couponObject.code === coupon),
    adopt(couponCode, price) {
        if (this.validate(couponCode)) {
            return Math.max(price - this.getCoupon(couponCode)?.value, 0)
        } else {
            throw new Error("coupon is not valid!")
        }
    }
}

const basket = {}


const eventManager = {
    add(event) {
        foodManager.add(Number(event.target.parentNode.parentNode.parentNode.parentNode.id))
        domManager.refresh()
    },
    subtract(event) {
        foodManager.subtract(Number(event.target.parentNode.parentNode.parentNode.parentNode.id))
        domManager.refresh()
    },
    applyCoupon() {
        if (couponManager.validate(couponText.value)) {
            stateManager.state.coupon.code = couponText.value
            stateManager.state.coupon.validated = true
            stateManager.state.coupon.percentage = couponManager.getCoupon(couponText.value).value
            domManager.refresh()
        }
    },
    buy(){
        modalElement.classList.remove('d-none')
        backgroundElement.classList.remove('d-none')
    },
    ok(){
        modalElement.classList.add('d-none')
        backgroundElement.classList.add('d-none')
    }

}

const foodManager = {
    foods: [],
    generateFoodObject: (id, name, price, picture) => {
        return {id, name, price, picture, quantity: 0}
    },
    fetchFoodsFromDatabaseAndLoad() {
        databaseManager.food.forEach(food => {
            this.foods.push(this.generateFoodObject(food.id, food.name, food.price, food.picture))
        })
    },
    getFoodById(id) {
        return this.foods.find(food => food.id === id)
    },
    add(id) {
        const food = this.getFoodById(id)
        if (!!food) {
            food.quantity++
        } else {
            throw new Error("Food does not exist!")
        }
    },
    subtract(id) {
        const food = this.getFoodById(id)
        if (!!food) {
            if (food.quantity !== 0) food.quantity--
        } else {
            throw new Error("Food does not exist!")
        }
    },
    totalPrice() {
        let totalPrice = 0
        this.foods.forEach(food => {
            let {quantity, price} = food
            totalPrice += quantity * price
        })
        return totalPrice
    }
}


couponButton.addEventListener('click', eventManager.applyCoupon)
finishButton.addEventListener("click",eventManager.buy)
okButtonElement.addEventListener('click',eventManager.ok)
// console.log(couponManager.adopt("sina", 20000))
// console.log(foodManager.generateFoodObject(1, "معجون", 8000))
foodManager.fetchFoodsFromDatabaseAndLoad()
foodManager.add(8)
foodManager.add(8)
foodManager.add(1)
// foodManager.add(1)
// foodManager.add(2)
// foodManager.add(3)
// foodManager.add(4)
foodManager.subtract(8)
console.log(foodManager.totalPrice())


domManager.deleteFoods()
domManager.refresh()
