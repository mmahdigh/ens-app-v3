import { useMemo } from 'react'
import { encodeFunctionData, namehash } from 'viem'
import { useConnectorClient, useEstimateGas } from 'wagmi'

import { publicResolverSetAddrSnippet } from '@ensdomains/ensjs/contracts'

import { useProfile } from '@app/hooks/useProfile'
import { emptyAddress } from '@app/utils/constants'

import { useIsWrapped } from '../useIsWrapped'
import { useResolverHasInterfaces } from '../useResolverHasInterfaces'

type UseResolverIsAuthorisedParameters = {
  name: string

  enabled?: boolean
}

export const useResolverIsAuthorised = ({
  name,
  enabled: enabled_ = true,
}: UseResolverIsAuthorisedParameters) => {
  const enabled = enabled_ && !!name

  const connector = useConnectorClient()

  const profile = useProfile({
    name,
    enabled,
  })
  const resolverAddress = profile.data?.resolverAddress

  const {
    data: isWrapped,
    isLoading: isWrappedLoading,
    isFetching: isWrappedFetching,
  } = useIsWrapped({ name, enabled })

  const isDependentDataLoading = profile.isLoading || connector.isLoading

  const {
    data: [resolverSupportsMultiAddress] = [false],
    knownResolverData,
    isLoading: isResolverHasInterfacesLoading,
    isFetching: isResolverHasInterfacesFetching,
  } = useResolverHasInterfaces({
    interfaceNames: ['MultiCoinAddressResolver'],
    resolverAddress: resolverAddress!,
    enabled: enabled && !isDependentDataLoading && !!resolverAddress,
  })
  const {
    data: estimateGasData,
    isLoading: isEstimateGasLoading,
    isError: isEstimateGasError,
    isFetching: isEstimateGasFetching,
  } = useEstimateGas({
    to: resolverAddress,
    account: connector.data?.account,
    data: encodeFunctionData({
      abi: publicResolverSetAddrSnippet,
      args: [namehash(name), 60n, emptyAddress],
    }),

    query: {
      enabled:
        enabled &&
        !isDependentDataLoading &&
        !knownResolverData &&
        resolverSupportsMultiAddress &&
        !!resolverAddress,
    },
  })

  const isLoading =
    isDependentDataLoading ||
    isResolverHasInterfacesLoading ||
    isEstimateGasLoading ||
    isWrappedLoading

  const data = useMemo(() => {
    if (!enabled || isLoading) return undefined
    if (!resolverSupportsMultiAddress) return { isValid: false, isAuthorised: false }
    if (knownResolverData)
      return {
        isValid: true,
        isAuthorised: isWrapped ? knownResolverData.isNameWrapperAware : true,
      }
    return {
      isValid: true,
      isAuthorised: !isEstimateGasError && estimateGasData !== undefined && estimateGasData > 0n,
    }
  }, [
    enabled,
    isLoading,
    resolverSupportsMultiAddress,
    knownResolverData,
    isWrapped,
    isEstimateGasError,
    estimateGasData,
  ])

  return {
    data,
    isLoading,
    isFetching:
      profile.isFetching ||
      isResolverHasInterfacesFetching ||
      isEstimateGasFetching ||
      isWrappedFetching,
  }
}
