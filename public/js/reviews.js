document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('review-form');
    const reviewList = document.getElementById('review-list');
    const reviewMessage = document.getElementById('review-message');
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const formData = new FormData(reviewForm);
    
        try {
            const response = await fetch('/reviews/add', {
            method: 'POST',
            body: JSON.stringify({
                review_text: formData.get('review_text'),
                inv_id: formData.get('inv_id'),
                account_id: formData.get('account_id')
            }),
            headers: {
                'Content-Type': 'application/json'
            }
            });
    
            const result = await response.json();
    
            if (response.ok) {
            reviewMessage.textContent = 'Review added successfully!';
            reviewMessage.style.color = 'green';
    
            const newReview = document.createElement('div');
            newReview.classList.add('review');
            newReview.innerHTML = `<p><strong>${result.screen_name}</strong>: ${formData.get('review_text')}</p>`;
            reviewList.appendChild(newReview);
    
            reviewForm.reset();
            } else {
            reviewMessage.textContent = result.error || 'Failed to add review.';
            reviewMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Error:', error);
            reviewMessage.textContent = 'An unexpected error occurred.';
            reviewMessage.style.color = 'red';
        }
        });
    }
    });