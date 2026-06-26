import { component$ } from '@qwik.dev/core'

import guitars from '../data/example-guitars'

export const GuitarRecommendation = component$(
  ({ id }: { id: string | number }) => {
    const guitar = guitars.find((item) => item.id === Number(id))

    if (!guitar) {
      return null
    }

    return (
      <section class="guitar-card" aria-label={`Recommended ${guitar.name}`}>
        <div class="guitar-image-wrap">
          <img src={guitar.image} alt={guitar.name} />
        </div>
        <div class="guitar-content">
          <h3>{guitar.name}</h3>
          <p>{guitar.shortDescription}</p>
          <div class="guitar-meta">
            <strong>${guitar.price}</strong>
            <span>Recommended pick</span>
          </div>
        </div>
      </section>
    )
  },
)
