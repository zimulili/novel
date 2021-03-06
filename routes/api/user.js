const fs = require('fs')
const router = require('koa-router')()
const jwt = require('jsonwebtoken')

const h = require('../../conf').h
const userdao = require('../../models/dao/userdao')
const historydao = require('../../models/dao/historydao')

// select novel
router.post('/login', async (ctx, next) => {
	try	{

		console.log(ctx.request.body)
		let nickname = ctx.request.query.name || ctx.request.body.name
		let password = ctx.request.query.ps || ctx.request.body.ps
		let result = {}
		let prikey = fs.readFileSync(__dirname+'/../../pri.pem')
		console.log(password)

		if (!nickname || !password) {
			ctx.body = ''
		} else {
			result = await userdao.findOne(nickname)
		}
		if (result.password == password && result && password) {
			let token = jwt.sign({
				exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
				data: {
					'nickname':nickname
				}
			}, prikey)
			console.log(token)
			ctx.cookies.set('token', token, {
				path: '/',
				httpOnly: 'true',
			})
			ctx.body = '233'
		} else {
			ctx.body = 'password err'
		}
	} catch (err) {
		ctx.body = err.message
	}
})

router.get('/info', async (ctx) => {
	try {
		let res = {}
		let uid = ctx.request.query.uid
		let nickname = ctx.request.query.name
		uid = parseInt(uid)
		if (uid || nickname) {
			let arg = uid || nickname
			res = await userdao.findOne(arg)
			delete res.password
			res = jsonPackage(res)
			ctx.body = res
		} else {
			throw new Error('@params uid||name')
		}
	} catch (err) {
		err_res(err, ctx, userinfoExample, userinfoExample2)
	}
})

router.post('/update', async (ctx) => {
	try {
		let res = {}
		let id = ctx.request.query.uid || ctx.request.body.uid
		let sex = ctx.request.query.sex || '♂♀' || ctx.request.body.sex
		let info = ctx.request.query.info || '' || ctx.request.body.info
		let password = ctx.request.query.ps || ctx.request.body.ps

		if (!id) {
			throw new Error('@params uid')
		} else {
			let _o = {
				sex,
				info,
				password,
			}
			if (!password) {
				delete _o.password
			}
			console.log(_o)
			await userdao.update(_o, id)
			ctx.body = jsonPackage(res)
		}
	} catch (err) {
		err_res(err, ctx)
	}
})

router.post('/create', async (ctx) => {
	try {

		let nickname = ctx.request.query.un || ctx.request.body.un
		let password = ctx.request.query.ps || ctx.request.body.ps

		if (nickname && password) {

			await userdao.create(nickname, password)
			ctx.body = jsonPackage({})

		} else {
			throw new Error('check params @ un || ps')
		}
	} catch (err) {
		let res = {}
		res = jsonPackage(res)
		res.status = 500
		res.errmsg = err.message
		ctx.body = res
	}
})

router.post('/history', async (ctx) => {
	try	{
		let res = {}
		let id = ctx.request.query.hid || ctx.request.body.hid
		let userid = ctx.request.query.uid || ctx.request.body.uid
		let novelid = ctx.request.query.nid || ctx.request.body.nid
		let chapter = ctx.request.query.cno || ctx.request.body.cno

		let _o = {userid, novelid, chapter}
		if (id && userid && novelid && chapter) {

			console.log('update')
			await historydao.update(id, _o)
			res = jsonPackage({})
			ctx.body = res

		} else if (userid && novelid && chapter) {

			console.log('create')
			await historydao.create(_o)
			res = jsonPackage({})
			ctx.body = res

		} else {
			throw new Error('@params uid||nid||cno')
		}
		// await err_res(err, ctx)
	} catch (err) {
		await err_res(err, ctx, historyExample, historyExample2)
	}
})

router.get('/history', async (ctx) => {
	try {
		let res = {}
		let uid = ctx.request.query.uid
		if (!uid) {
			throw new Error('check params')
		} else {
			res = await historydao.findAll(uid)
			ctx.body = jsonPackage(res)
		}
	} catch (err) {
		err_res(err, ctx)
	}
})


let historyExample = `${h}`+ '/api/user/history?uid=1&nid=1&cno=1&hid=1'
let historyExample2 = `${h}`+ '/api/user/history?uid=1&nid=1&cno=1'
let userinfoExample = `${h}` + '/api/user/info?uid=1'
let userinfoExample2 = `${h}` + '/api/user/info?name=eltoo'

function jsonPackage(arg) {
	var json = {
		status: 400,
		errmsg: '',
		data:{
			// timeStamp: '',
			// name: '',
			// website: '',
			// author: '',
			// title: '',
			// content: [],
		},
		doclink: `${h}/api/doc`,
	}

	if ((typeof arg) != 'object') {
		// throw new Error('argument is not json')
	} else {
		for(var key in arg) {
			json.data[key] = arg[key]
		}
		json.status = 200
		return json
	}
	return json
}

async function err_res (err, ctx, ...arg) {
	let res = {}
	res = jsonPackage(res)
	res.status = 404
	res.errmsg = err.message
	let example = []
	for(let k in arg) {
		example.push(arg[k])
	}
	res.example = example
	ctx.body = res
}

module.exports = router