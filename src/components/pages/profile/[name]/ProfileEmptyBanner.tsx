import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { Button, Typography } from '@ensdomains/thorin'

import StarsSVG from '@app/assets/Stars.svg'
import { useProfileActions } from '@app/hooks/useProfileActions'
import { AddressRecord } from '@app/types'

const Container = styled.div(
  ({ theme }) => css`
    margin-top: ${theme.space['4']};
    display: grid;
    grid-template-columns: 48px 1fr auto;
    align-items: center;
    gap: ${theme.space['6']};
    padding: ${theme.space['6']};
    width: 100%;
    border: 4px solid #fff;
    border-radius: 16px;
    background: linear-gradient(#e7f4ef 100%, #fdf0dd 100%);
  `,
)

export function ProfileEmptyBanner({
  name,
  addresses,
}: {
  addresses: AddressRecord[]
  name: string
}) {
  const { t } = useTranslation('profile')

  const profileActions = useProfileActions({
    name,
  })

  const filteredAddresses = useMemo(() => addresses.filter(({ value }) => value), [addresses])

  if (filteredAddresses.length) return null

  const action = (profileActions.profileActions ?? []).find(
    (i) => i.label === t('tabs.profile.actions.editProfile.label'),
  )

  return (
    <Container>
      <StarsSVG />
      <div>
        <Typography fontVariant="large" weight="bold" color="textPrimary">
          {t('banner.empty.title')}
        </Typography>
        <Typography color="textPrimary" fontVariant="body">
          {t('banner.empty.description')}
        </Typography>
      </div>
      <Button width="auto" colorStyle="orangePrimary" onClick={() => action?.onClick()}>
        {t('banner.empty.action')}
      </Button>
    </Container>
  )
}
