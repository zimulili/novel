const router = require('koa-router')()

// select novel
// router.get('/', async (ctx) => {
// 	ctx.body = jsonPackage({name:'kkk'})
// })

// create novel
router.post('/', async (ctx) => {
	
	let novelname = ctx.request.body.an

	ctx.body = jsonPackage({name:'kkk'})
})

// update novel
router.put('/', async (ctx) => {
	ctx.body = jsonPackage({name:'kkk'})
})

// delete novel
router.delete('/', async (ctx) => {
	ctx.body = jsonPackage({name:'kkk'})
})

function jsonPackage(arg) {
	var json = {
		status: 400,
		errmsg: '',
		data:{
			name: '',
			website: [],
			author: '',
			timeStamp: '',
		},
		doclink: 'http://127.0.0.1',
		example: 'http://127.0.0.1',
	}

	if ((typeof arg) != 'object') {
		throw new Error('argument is not json')
	} else {
		for(var key in arg) {
			json.data[key] = arg[key]
		}
		json.status = 200
		return json
	}
	return json
}


module.exports = router