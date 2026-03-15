
const form = document.getElementById("form")
const result = document.getElementById("result")
const resultTitle = document.getElementById("result-title")
const resultExplanation = document.getElementById("result-explanation")
const resultWatch = document.getElementById("result-watch")
const goBtn = document.getElementById("go-btn")
const resetBtn = document.getElementById("reset-btn")


form.addEventListener("submit", submitForm)

async function submitForm(event) {
    event.preventDefault()

    const movie = document.getElementById("movie").value
    const genre = document.querySelector('input[name="genre"]:checked')?.value
    const era = document.querySelector('input[name="era"]:checked')?.value
    const time = document.querySelector('input[name="length"]:checked')?.value
    
    if (!movie || !genre || !era || !time) {
        alert("Please answer all questions!")
    return
}

    const prompt = `You are a movie recommendation expert. Based on the following preferences, recommend ONE perfect movie.

        The user's favourite movie and why: ${movie}
        Era preference: ${era}
        Mood: ${genre}
        Length preference: ${time} (short = under 90 mins, medium = 90-120 mins, long = over 120 mins)

        Respond in this exact format and nothing else:
        TITLE: [movie title]
        EXPLANATION: [2-3 sentences explaining why this movie suits them personally, referencing their favourite movie]
        WATCH: [one or two streaming platforms where they can watch it, or "Available to rent on Amazon/Apple TV" if not on a major platform]`

    goBtn.textContent = "Searching..."
    goBtn.disabled = true

    try {
        const response = await fetch("/api/recommend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "user", content: prompt }
                ]
            })
        })

        const data = await response.json()
        const text = data.content[0].text

        const title = text.match(/TITLE:\s*(.+)/)?.[1]?.trim()
        const explanation = text.match(/EXPLANATION:\s*(.+)/)?.[1]?.trim()
        const watch = text.match(/WATCH:\s*(.+)/)?.[1]?.trim()

        const posterUrl = await fetchPoster(title)
        const posterImg = document.getElementById("result-poster")

        if (posterUrl) {
            posterImg.src = posterUrl
            posterImg.classList.remove("hidden")
        } else {
            posterImg.classList.add("hidden")
        }

        resultTitle.textContent = title
        resultExplanation.textContent = explanation
        resultWatch.textContent = `📺 ${watch}`

        form.classList.add("hidden")
        result.classList.remove("hidden")

    } catch (error) {
        alert("Something went wrong. Please try again.")
        console.error(error)
    } finally {
        goBtn.textContent = "Let's Go"
        goBtn.disabled = false
    }
}

async function fetchPoster(title) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=c37c70f2f468ebab446670e4f8751dc9&query=${encodeURIComponent(title)}`)
    const data = await response.json()
    const poster = data.results[0]?.poster_path
    if (poster) {
        return `https://image.tmdb.org/t/p/w500${poster}`
    }
    return null
}

resetBtn.addEventListener("click", () => {
    result.classList.add("hidden")
    form.classList.remove("hidden")
    form.reset()
})