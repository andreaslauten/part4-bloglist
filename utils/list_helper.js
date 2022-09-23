const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => {
        return sum + blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    } else {
        const maxLikes = Math.max(...blogs.map(blog => blog.likes))
        const favoriteBlog = blogs.find(blog => blog.likes === maxLikes)
        return {
            title: favoriteBlog.title,
            author: favoriteBlog.author,
            likes: favoriteBlog.likes
        }
    }
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null
    } else {
        const list = []
        blogs.forEach(blog => {
            const itemWithSameAuthor = list.find(item => item.author === blog.author)
            if (itemWithSameAuthor) {
                itemWithSameAuthor.blogs +=1
            } else {
                list.push({ author: blog.author, blogs: 1 })
            }   
        })
    
        const maxBlogCount = Math.max(...list.map(item => item.blogs))
        return list.find(item => item.blogs === maxBlogCount)
    } 
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return null
    } else {
        const list = []
        blogs.forEach(blog => {
            const itemWithSameAuthor = list.find(item => item.author === blog.author)
            if (itemWithSameAuthor) {
                itemWithSameAuthor.likes += blog.likes
            } else {
                list.push({ author: blog.author, likes: blog.likes })
            }   
        })
    
        const maxLikes = Math.max(...list.map(item => item.likes))
        return list.find(item => item.likes === maxLikes)
    } 
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}